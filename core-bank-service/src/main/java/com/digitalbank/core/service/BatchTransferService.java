package com.digitalbank.core.service;

import com.digitalbank.core.client.RiskClient;
import com.digitalbank.core.dto.*;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.entity.BatchTransfer;
import com.digitalbank.core.entity.Transaction;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.BatchTransferRepository;
import com.digitalbank.core.repository.TransactionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 批量转账服务，ADR-008。
 * 支持批量转账（单笔独立事务）、幂等控制（batchId）、并行处理（最多10并发）。
 *
 * @author Digital Bank POC Team
 */
@Service
public class BatchTransferService {

    private static final Logger log = LoggerFactory.getLogger(BatchTransferService.class);
    private static final int MAX_PARALLEL = 10;
    private static final String TYPE_TRANSFER_OUT = "transfer_out";
    private static final String TYPE_TRANSFER_IN = "transfer_in";
    private static final String STATUS_COMPLETED = "completed";

    private final BatchTransferRepository batchTransferRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final RiskClient riskClient;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executor;

    public BatchTransferService(BatchTransferRepository batchTransferRepository,
                                 AccountRepository accountRepository,
                                 TransactionRepository transactionRepository,
                                 RiskClient riskClient,
                                 OutboxService outboxService,
                                 ObjectMapper objectMapper) {
        this.batchTransferRepository = batchTransferRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.riskClient = riskClient;
        this.outboxService = outboxService;
        this.objectMapper = objectMapper;
        this.executor = Executors.newFixedThreadPool(MAX_PARALLEL);
    }

    /**
     * 批量转账，ADR-008。
     * 单笔独立事务，允许部分失败，batchId 幂等。
     *
     * @param request 批量转账请求
     * @return 批量转账响应
     * @throws BusinessException CBB010 超过限制
     */
    public BatchTransferResponse batchTransfer(BatchTransferRequest request) {
        String batchId = request.getBatchId().trim();
        List<TransferItem> transfers = request.getTransfers();

        if (transfers.size() > 100) {
            throw new BusinessException("CBB010", "批量转账超过限制（最多100笔）", 400);
        }

        // 幂等检查：同一 batchId 返回原结果
        Optional<BatchTransfer> existing = batchTransferRepository.findByBatchId(batchId);
        if (existing.isPresent()) {
            log.info("batchTransfer 幂等返回, batchId={}", batchId);
            return toResponse(existing.get());
        }

        // 预加载所有涉及账户
        Set<Long> accountIds = new HashSet<>();
        for (TransferItem item : transfers) {
            accountIds.add(item.getFromAccountId());
            accountIds.add(item.getToAccountId());
        }
        Map<Long, Account> accountMap = accountRepository.findAllById(accountIds)
                .stream().collect(Collectors.toMap(Account::getId, a -> a));

        // 并行处理每笔转账
        List<CompletableFuture<TransferResult>> futures = new ArrayList<>();
        for (int i = 0; i < transfers.size(); i++) {
            final int index = i;
            final TransferItem item = transfers.get(i);
            CompletableFuture<TransferResult> future = CompletableFuture.supplyAsync(() -> {
                return executeSingleTransfer(index, item, accountMap);
            }, executor);
            futures.add(future);
        }

        // 等待所有完成
        List<TransferResult> results = new ArrayList<>();
        for (CompletableFuture<TransferResult> f : futures) {
            try {
                results.add(f.get(30, TimeUnit.SECONDS));
            } catch (Exception e) {
                log.error("批量转账执行异常", e);
                results.add(TransferResult.failed(results.size(), "CBS001", "执行超时或异常"));
            }
        }

        // 按 index 排序
        results.sort(Comparator.comparingInt(TransferResult::getIndex));

        int successCount = (int) results.stream().filter(r -> "completed".equals(r.getStatus())).count();
        int failedCount = results.size() - successCount;

        // 保存批量转账记录
        BatchTransfer batch = new BatchTransfer();
        batch.setBatchId(batchId);
        batch.setTotalCount(results.size());
        batch.setSuccessCount(successCount);
        batch.setFailedCount(failedCount);
        try {
            batch.setResultJson(objectMapper.writeValueAsString(results));
        } catch (JsonProcessingException e) {
            log.error("序列化批量结果失败", e);
            batch.setResultJson("[]");
        }
        batchTransferRepository.save(batch);

        log.info("batchTransfer 完成, batchId={}, total={}, success={}, failed={}",
                batchId, results.size(), successCount, failedCount);

        return new BatchTransferResponse(batchId, results.size(), successCount, failedCount, results);
    }

    /**
     * 执行单笔转账（独立事务）
     */
    @Transactional
    public TransferResult executeSingleTransfer(int index, TransferItem item, Map<Long, Account> accountMap) {
        try {
            Long fromId = item.getFromAccountId();
            Long toId = item.getToAccountId();
            BigDecimal amount = item.getAmount();

            // 基本校验
            if (fromId.equals(toId)) {
                return TransferResult.failed(index, "CBB005", "同账户转账");
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return TransferResult.failed(index, "CBB004", "转账金额无效");
            }

            // 检查账户存在性
            Account fromAcc = accountMap.get(fromId);
            Account toAcc = accountMap.get(toId);
            if (fromAcc == null) {
                return TransferResult.failed(index, "CBB001", "转出账户不存在");
            }
            if (toAcc == null) {
                return TransferResult.failed(index, "CBB001", "转入账户不存在");
            }

            // 风控检查
            try {
                riskClient.checkTransfer(fromAcc.getCustomerId(), fromId, amount, toId);
            } catch (BusinessException e) {
                return TransferResult.failed(index, e.getErrorCode(), e.getMessage());
            }

            // 按 id 顺序加锁，避免死锁
            Long id1 = fromId < toId ? fromId : toId;
            Long id2 = fromId < toId ? toId : fromId;
            Account a1 = accountRepository.findByIdForUpdate(id1).orElse(null);
            Account a2 = accountRepository.findByIdForUpdate(id2).orElse(null);
            if (a1 == null || a2 == null) {
                return TransferResult.failed(index, "CBB001", "账户不存在");
            }
            Account lockedFrom = fromId.equals(id1) ? a1 : a2;
            Account lockedTo = toId.equals(id1) ? a1 : a2;

            // 状态检查
            if (!"active".equals(lockedFrom.getStatus())) {
                return TransferResult.failed(index, "CBB003", "转出账户已冻结");
            }
            if (!"active".equals(lockedTo.getStatus())) {
                return TransferResult.failed(index, "CBB003", "转入账户已冻结");
            }
            if (lockedFrom.getBalance().compareTo(amount) < 0) {
                return TransferResult.failed(index, "CBB002", "余额不足");
            }

            // 执行转账
            lockedFrom.setBalance(lockedFrom.getBalance().subtract(amount));
            lockedTo.setBalance(lockedTo.getBalance().add(amount));
            accountRepository.save(lockedFrom);
            accountRepository.save(lockedTo);

            // 创建交易记录
            String baseId = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
            String txOutId = "TX" + baseId + "O";
            String txInId = "TX" + baseId + "I";

            Transaction out = new Transaction();
            out.setTransactionId(txOutId);
            out.setAccountId(fromId);
            out.setCounterAccountId(toId);
            out.setAmount(amount);
            out.setTransactionType(TYPE_TRANSFER_OUT);
            out.setStatus(STATUS_COMPLETED);
            out.setRemark(item.getRemark());
            transactionRepository.save(out);

            Transaction in = new Transaction();
            in.setTransactionId(txInId);
            in.setAccountId(toId);
            in.setCounterAccountId(fromId);
            in.setAmount(amount);
            in.setTransactionType(TYPE_TRANSFER_IN);
            in.setStatus(STATUS_COMPLETED);
            in.setRemark(item.getRemark());
            transactionRepository.save(in);

            // 写入 outbox 事件
            outboxService.recordEvent(
                    "BATCH_TRANSFER_ITEM_COMPLETED",
                    "batch-transfer",
                    txOutId,
                    txOutId,
                    Map.of(
                            "txOutId", txOutId,
                            "txInId", txInId,
                            "fromAccountId", fromId,
                            "toAccountId", toId,
                            "amount", amount,
                            "status", STATUS_COMPLETED
                    ));

            log.debug("批量转账单笔成功, index={}, txId={}", index, txOutId);
            return TransferResult.success(index, txOutId);

        } catch (Exception e) {
            log.error("批量转账单笔失败, index={}", index, e);
            return TransferResult.failed(index, "CBS001", "系统错误: " + e.getMessage());
        }
    }

    /**
     * 将数据库记录转换为响应
     */
    private BatchTransferResponse toResponse(BatchTransfer batch) {
        List<TransferResult> results;
        try {
            results = objectMapper.readValue(batch.getResultJson(), new TypeReference<List<TransferResult>>() {});
        } catch (JsonProcessingException e) {
            log.error("反序列化批量结果失败", e);
            results = Collections.emptyList();
        }
        return new BatchTransferResponse(
                batch.getBatchId(),
                batch.getTotalCount(),
                batch.getSuccessCount(),
                batch.getFailedCount(),
                results
        );
    }
}
