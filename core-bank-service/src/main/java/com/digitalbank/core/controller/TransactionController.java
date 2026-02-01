package com.digitalbank.core.controller;

import com.digitalbank.core.dto.*;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.service.BatchTransferService;
import com.digitalbank.core.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

/**
 * 交易 REST API：/api/v1/transactions。
 * 支付扣款（debit）、行内转账（transfer）、批量转账（batch-transfer）、交易查询、交易历史。
 * 遵循 ADR-005、ADR-008、OpenAPI。
 *
 * @author Digital Bank POC Team
 */
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final BatchTransferService batchTransferService;

    public TransactionController(TransactionService transactionService,
                                  BatchTransferService batchTransferService) {
        this.transactionService = transactionService;
        this.batchTransferService = batchTransferService;
    }

    /**
     * 支付扣款，ADR-005。幂等：同一 refId 返回同一 transactionId。供 Agent 2 支付服务调用。
     */
    @PostMapping("/debit")
    public ResponseEntity<ApiResponse<DebitResponse>> debit(@Valid @RequestBody DebitRequest request) {
        DebitResponse data = transactionService.debit(request);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * 行内转账。转账前调用风控 POST /api/v1/risk/check；403 风控拦截。
     */
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(@Valid @RequestBody TransferRequest request) {
        TransferResponse data = transactionService.transfer(request);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 批量转账，ADR-008。单批最多 100 笔，batchId 幂等。
     * 单笔独立事务，允许部分失败。
     */
    @PostMapping("/batch-transfer")
    public ResponseEntity<ApiResponse<BatchTransferResponse>> batchTransfer(@Valid @RequestBody BatchTransferRequest request) {
        BatchTransferResponse data = batchTransferService.batchTransfer(request);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 交易查询，accountId、status 可选，分页。
     */
    @GetMapping
    public ResponseEntity<ApiResponse<TransactionListResponse>> listTransactions(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        TransactionListResponse data = transactionService.listTransactions(accountId, status, page, pageSize);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 交易历史，accountId 必填，from、to 可选时间范围，分页。
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<TransactionListResponse>> getTransactionHistory(
            @RequestParam Long accountId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Instant fromInst = null, toInst = null;
        try {
            if (from != null && !from.isBlank()) {
                fromInst = Instant.parse(from);
            }
            if (to != null && !to.isBlank()) {
                toInst = Instant.parse(to);
            }
        } catch (Exception e) {
            throw new BusinessException("CBV003", "from/to 格式需为 ISO 8601", 400);
        }
        TransactionListResponse data = transactionService.getTransactionHistory(accountId, fromInst, toInst, page, pageSize);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
