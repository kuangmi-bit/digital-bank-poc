package com.digitalbank.core.service;

import com.digitalbank.core.client.RiskClient;
import com.digitalbank.core.dto.*;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.entity.Transaction;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 交易服务：支付扣款（幂等 refId）、行内转账（风控）、交易查询、交易历史。
 * 遵循 ADR-005、OpenAPI、technical-standards。
 *
 * @author Digital Bank POC Team
 */
@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);
    private static final String TYPE_PAYMENT = "payment";
    private static final String TYPE_TRANSFER_OUT = "transfer_out";
    private static final String TYPE_TRANSFER_IN = "transfer_in";
    private static final String STATUS_COMPLETED = "completed";

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final RiskClient riskClient;
    private final OutboxService outboxService;

    public TransactionService(AccountRepository accountRepository,
                              TransactionRepository transactionRepository,
                              RiskClient riskClient,
                              OutboxService outboxService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.riskClient = riskClient;
        this.outboxService = outboxService;
    }

    /**
     * 支付扣款，ADR-005。同一 refId 多次请求返回同一 transactionId，不重复扣款。
     *
     * @param request accountId, amount, refId, remark?
     * @return DebitResponse 201
     * @throws BusinessException CBB001 账户不存在；CBB002 余额不足；CBB003 账户已冻结；CBV003 必填/格式
     */
    @Transactional
    public DebitResponse debit(DebitRequest request) {
        String refId = request.getRefId() != null ? request.getRefId().trim() : "";
        if (refId.isEmpty()) {
            throw new BusinessException("CBV003", "refId 不能为空", 400);
        }

        // 幂等：同一 refId 已存在则直接返回
        var existing = transactionRepository.findByRefId(refId);
        if (existing.isPresent()) {
            Transaction t = existing.get();
            log.info("debit 幂等返回, refId={}, transactionId={}", refId, t.getTransactionId());
            return new DebitResponse(t.getTransactionId(), t.getAccountId(), t.getAmount(), t.getStatus());
        }

        Long accountId = request.getAccountId();
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("CBV002", "金额必须大于 0", 400);
        }

        Account a = accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new BusinessException("CBB001", "账户不存在", 404));
        if (!"active".equals(a.getStatus())) {
            throw new BusinessException("CBB003", "账户已冻结", 400);
        }
        if (a.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("CBB002", "余额不足", 400);
        }

        a.setBalance(a.getBalance().subtract(amount));
        accountRepository.save(a);

        String txId = UUID.randomUUID().toString().replace("-", "");
        Transaction t = new Transaction();
        t.setTransactionId(txId);
        t.setAccountId(accountId);
        t.setCounterAccountId(null);
        t.setAmount(amount);
        t.setTransactionType(TYPE_PAYMENT);
        t.setStatus(STATUS_COMPLETED);
        t.setRemark(request.getRemark());
        t.setRefId(refId);
        transactionRepository.save(t);

        // 分布式事务：写入 outbox 事件（同事务），供异步通知/回调/消息投递使用
        outboxService.recordEvent(
                "PAYMENT_DEBIT_COMPLETED",
                "payment",
                refId,
                refId,
                java.util.Map.of(
                        "transactionId", txId,
                        "accountId", accountId,
                        "amount", amount,
                        "refId", refId,
                        "status", STATUS_COMPLETED
                ));

        log.info("debit 成功, transactionId={}, accountId={}, amount={}, refId={}", txId, accountId, amount, refId);
        return new DebitResponse(txId, accountId, amount, STATUS_COMPLETED);
    }

    /**
     * 行内转账。转账前调用风控 POST /api/v1/risk/check；403 抛 RKB001。
     *
     * @param request fromAccountId, toAccountId, amount, remark?
     * @return TransferResponse
     * @throws BusinessException CBB001 账户不存在；CBB002 余额不足；CBB003 冻结；CBB004 金额无效；CBB005 同账户；RKB001 风控拦截
     */
    @Transactional
    public TransferResponse transfer(TransferRequest request) {
        Long fromId = request.getFromAccountId();
        Long toId = request.getToAccountId();
        BigDecimal amount = request.getAmount();

        if (fromId.equals(toId)) {
            throw new BusinessException("CBB005", "同账户转账", 400);
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("CBB004", "转账金额无效", 400);
        }

        // 取 from 账户用于风控 customerId（不加锁）
        Account fromForRisk = accountRepository.findById(fromId)
                .orElseThrow(() -> new BusinessException("CBB001", "账户不存在", 404));
        riskClient.checkTransfer(fromForRisk.getCustomerId(), fromId, amount, toId);

        // 按 id 顺序加锁，避免死锁
        Long id1 = fromId < toId ? fromId : toId;
        Long id2 = fromId < toId ? toId : fromId;
        Account a1 = accountRepository.findByIdForUpdate(id1)
                .orElseThrow(() -> new BusinessException("CBB001", "账户不存在", 404));
        Account a2 = accountRepository.findByIdForUpdate(id2)
                .orElseThrow(() -> new BusinessException("CBB001", "账户不存在", 404));
        Account fromAcc = fromId.equals(id1) ? a1 : a2;
        Account toAcc = toId.equals(id1) ? a1 : a2;

        if (!"active".equals(fromAcc.getStatus())) {
            throw new BusinessException("CBB003", "转出账户已冻结", 400);
        }
        if (!"active".equals(toAcc.getStatus())) {
            throw new BusinessException("CBB003", "转入账户已冻结", 400);
        }
        if (fromAcc.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("CBB002", "余额不足", 400);
        }

        fromAcc.setBalance(fromAcc.getBalance().subtract(amount));
        toAcc.setBalance(toAcc.getBalance().add(amount));
        accountRepository.save(fromAcc);
        accountRepository.save(toAcc);

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
        out.setRemark(request.getRemark());
        transactionRepository.save(out);

        Transaction in = new Transaction();
        in.setTransactionId(txInId);
        in.setAccountId(toId);
        in.setCounterAccountId(fromId);
        in.setAmount(amount);
        in.setTransactionType(TYPE_TRANSFER_IN);
        in.setStatus(STATUS_COMPLETED);
        in.setRemark(request.getRemark());
        transactionRepository.save(in);

        // 分布式事务：写入 outbox 事件（同事务）
        outboxService.recordEvent(
                "TRANSFER_COMPLETED",
                "transfer",
                txOutId,
                txOutId,
                java.util.Map.of(
                        "txOutId", txOutId,
                        "txInId", txInId,
                        "fromAccountId", fromId,
                        "toAccountId", toId,
                        "amount", amount,
                        "status", STATUS_COMPLETED
                ));

        log.info("transfer 成功, txOutId={}, from={}, to={}, amount={}", txOutId, fromId, toId, amount);
        return new TransferResponse(txOutId, fromId, toId, amount, STATUS_COMPLETED);
    }

    /**
     * 交易查询，支持 accountId、status 可选过滤，分页。
     */
    public TransactionListResponse listTransactions(Long accountId, String status, int page, int pageSize) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, pageSize)),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Transaction> slice = transactionRepository.findWithFilters(accountId, status, p);
        List<TransactionResponse> items = slice.getContent().stream().map(TransactionResponse::from).collect(Collectors.toList());
        return new TransactionListResponse(items, slice.getTotalElements(), slice.getNumber() + 1, slice.getSize());
    }

    /**
     * 交易历史，accountId 必填，from/to 可选时间范围，分页。
     */
    public TransactionListResponse getTransactionHistory(Long accountId, Instant from, Instant to, int page, int pageSize) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, pageSize)),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Transaction> slice;
        if (from != null && to != null) {
            slice = transactionRepository.findByAccountIdAndCreatedAtBetween(accountId, from, to, p);
        } else {
            slice = transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId, p);
        }
        List<TransactionResponse> items = slice.getContent().stream().map(TransactionResponse::from).collect(Collectors.toList());
        return new TransactionListResponse(items, slice.getTotalElements(), slice.getNumber() + 1, slice.getSize());
    }
}
