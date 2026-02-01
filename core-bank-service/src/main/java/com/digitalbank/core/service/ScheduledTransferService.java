package com.digitalbank.core.service;

import com.digitalbank.core.dto.*;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.entity.ScheduledTransfer;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.ScheduledTransferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 预约转账服务，ADR-008。
 * 支持创建、查询、取消预约转账，定时调度执行到期任务。
 *
 * @author Digital Bank POC Team
 */
@Service
public class ScheduledTransferService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTransferService.class);
    private static final int MAX_RETRY = 3;

    private final ScheduledTransferRepository scheduledTransferRepository;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;

    public ScheduledTransferService(ScheduledTransferRepository scheduledTransferRepository,
                                     AccountRepository accountRepository,
                                     TransactionService transactionService) {
        this.scheduledTransferRepository = scheduledTransferRepository;
        this.accountRepository = accountRepository;
        this.transactionService = transactionService;
    }

    /**
     * 创建预约转账，ADR-008。
     *
     * @param request 预约转账请求
     * @return 预约转账响应
     * @throws BusinessException CBB011 预约时间无效；CBB001 账户不存在；CBB005 同账户
     */
    @Transactional
    public ScheduledTransferResponse createScheduledTransfer(ScheduledTransferRequest request) {
        Long fromId = request.getFromAccountId();
        Long toId = request.getToAccountId();
        Instant scheduledTime = request.getScheduledTime();

        // 校验
        if (fromId.equals(toId)) {
            throw new BusinessException("CBB005", "同账户转账", 400);
        }
        if (scheduledTime == null || scheduledTime.isBefore(Instant.now().plus(1, ChronoUnit.MINUTES))) {
            throw new BusinessException("CBB011", "预约时间必须至少在 1 分钟后", 400);
        }

        // 验证账户存在
        Account fromAcc = accountRepository.findById(fromId)
                .orElseThrow(() -> new BusinessException("CBB001", "转出账户不存在", 404));
        if (!accountRepository.existsById(toId)) {
            throw new BusinessException("CBB001", "转入账户不存在", 404);
        }

        // 创建预约
        ScheduledTransfer scheduled = new ScheduledTransfer();
        scheduled.setScheduledId(UUID.randomUUID().toString());
        scheduled.setFromAccountId(fromId);
        scheduled.setToAccountId(toId);
        scheduled.setAmount(request.getAmount());
        scheduled.setScheduledTime(scheduledTime);
        scheduled.setStatus("pending");
        scheduled.setRemark(request.getRemark());
        scheduledTransferRepository.save(scheduled);

        log.info("预约转账创建成功, scheduledId={}, from={}, to={}, amount={}, time={}",
                scheduled.getScheduledId(), fromId, toId, request.getAmount(), scheduledTime);

        return ScheduledTransferResponse.from(scheduled);
    }

    /**
     * 查询预约转账列表
     */
    public ScheduledTransferListResponse listScheduledTransfers(Long accountId, String status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, pageSize)));
        Page<ScheduledTransfer> slice;
        if (status != null && !status.isBlank()) {
            slice = scheduledTransferRepository.findByFromAccountIdAndStatus(accountId, status, pageable);
        } else {
            slice = scheduledTransferRepository.findByFromAccountIdOrderByScheduledTimeDesc(accountId, pageable);
        }
        List<ScheduledTransferResponse> items = slice.getContent().stream()
                .map(ScheduledTransferResponse::from)
                .collect(Collectors.toList());
        return new ScheduledTransferListResponse(items, slice.getTotalElements(), slice.getNumber() + 1, slice.getSize());
    }

    /**
     * 取消预约转账
     *
     * @throws BusinessException CBB012 预约不存在；CBB013 预约已执行/取消
     */
    @Transactional
    public ScheduledTransferResponse cancelScheduledTransfer(String scheduledId) {
        ScheduledTransfer scheduled = scheduledTransferRepository.findByScheduledIdForUpdate(scheduledId)
                .orElseThrow(() -> new BusinessException("CBB012", "预约不存在", 404));

        if (!"pending".equals(scheduled.getStatus())) {
            throw new BusinessException("CBB013", "预约已执行或已取消，无法取消", 400);
        }

        scheduled.setStatus("cancelled");
        scheduledTransferRepository.save(scheduled);

        log.info("预约转账取消成功, scheduledId={}", scheduledId);
        return ScheduledTransferResponse.from(scheduled);
    }

    /**
     * 查询单个预约转账
     */
    public ScheduledTransferResponse getScheduledTransfer(String scheduledId) {
        ScheduledTransfer scheduled = scheduledTransferRepository.findByScheduledId(scheduledId)
                .orElseThrow(() -> new BusinessException("CBB012", "预约不存在", 404));
        return ScheduledTransferResponse.from(scheduled);
    }

    /**
     * 定时任务：每分钟扫描到期预约并执行
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processDueTransfers() {
        Instant now = Instant.now();
        List<ScheduledTransfer> dueTransfers = scheduledTransferRepository.findDueTransfers(now);

        for (ScheduledTransfer scheduled : dueTransfers) {
            try {
                executeScheduledTransfer(scheduled);
            } catch (Exception e) {
                log.error("执行预约转账失败, scheduledId={}", scheduled.getScheduledId(), e);
                handleExecutionFailure(scheduled, e.getMessage());
            }
        }
    }

    /**
     * 执行单个预约转账
     */
    @Transactional
    public void executeScheduledTransfer(ScheduledTransfer scheduled) {
        // 加锁防止重复执行
        ScheduledTransfer locked = scheduledTransferRepository.findByScheduledIdForUpdate(scheduled.getScheduledId())
                .orElse(null);
        if (locked == null || !"pending".equals(locked.getStatus())) {
            return; // 已被处理
        }

        locked.setStatus("processing");
        scheduledTransferRepository.save(locked);

        try {
            // 构建转账请求
            TransferRequest transferRequest = new TransferRequest();
            transferRequest.setFromAccountId(locked.getFromAccountId());
            transferRequest.setToAccountId(locked.getToAccountId());
            transferRequest.setAmount(locked.getAmount());
            transferRequest.setRemark("[预约转账] " + (locked.getRemark() != null ? locked.getRemark() : ""));

            // 执行转账
            TransferResponse response = transactionService.transfer(transferRequest);

            // 更新状态
            locked.setStatus("completed");
            locked.setTransactionId(response.getTransactionId());
            scheduledTransferRepository.save(locked);

            log.info("预约转账执行成功, scheduledId={}, transactionId={}", locked.getScheduledId(), response.getTransactionId());

        } catch (BusinessException e) {
            log.warn("预约转账业务失败, scheduledId={}, error={}", locked.getScheduledId(), e.getMessage());
            handleExecutionFailure(locked, e.getMessage());
        }
    }

    /**
     * 处理执行失败：重试或标记失败
     */
    private void handleExecutionFailure(ScheduledTransfer scheduled, String errorMessage) {
        scheduled.setRetryCount(scheduled.getRetryCount() + 1);
        scheduled.setErrorMessage(errorMessage);

        if (scheduled.getRetryCount() >= MAX_RETRY) {
            scheduled.setStatus("failed");
            log.warn("预约转账最终失败, scheduledId={}, retryCount={}", scheduled.getScheduledId(), scheduled.getRetryCount());
        } else {
            scheduled.setStatus("pending"); // 保持 pending 等待下次重试
            log.info("预约转账将重试, scheduledId={}, retryCount={}", scheduled.getScheduledId(), scheduled.getRetryCount());
        }
        scheduledTransferRepository.save(scheduled);
    }
}
