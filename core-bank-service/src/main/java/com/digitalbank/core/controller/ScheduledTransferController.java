package com.digitalbank.core.controller;

import com.digitalbank.core.dto.*;
import com.digitalbank.core.service.ScheduledTransferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 预约转账 REST API：/api/v1/transactions/scheduled，ADR-008。
 * 创建预约、查询列表、取消预约。
 *
 * @author Digital Bank POC Team
 */
@RestController
@RequestMapping("/api/v1/transactions/scheduled")
public class ScheduledTransferController {

    private final ScheduledTransferService scheduledTransferService;

    public ScheduledTransferController(ScheduledTransferService scheduledTransferService) {
        this.scheduledTransferService = scheduledTransferService;
    }

    /**
     * 创建预约转账
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduledTransferResponse>> createScheduledTransfer(
            @Valid @RequestBody ScheduledTransferRequest request) {
        ScheduledTransferResponse data = scheduledTransferService.createScheduledTransfer(request);
        return ResponseEntity.status(201).body(ApiResponse.created(data));
    }

    /**
     * 查询预约转账列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ScheduledTransferListResponse>> listScheduledTransfers(
            @RequestParam Long accountId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        ScheduledTransferListResponse data = scheduledTransferService.listScheduledTransfers(accountId, status, page, pageSize);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 查询单个预约转账
     */
    @GetMapping("/{scheduledId}")
    public ResponseEntity<ApiResponse<ScheduledTransferResponse>> getScheduledTransfer(
            @PathVariable String scheduledId) {
        ScheduledTransferResponse data = scheduledTransferService.getScheduledTransfer(scheduledId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 取消预约转账
     */
    @DeleteMapping("/{scheduledId}")
    public ResponseEntity<ApiResponse<ScheduledTransferResponse>> cancelScheduledTransfer(
            @PathVariable String scheduledId) {
        ScheduledTransferResponse data = scheduledTransferService.cancelScheduledTransfer(scheduledId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
