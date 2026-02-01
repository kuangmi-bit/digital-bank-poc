package com.digitalbank.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 批量转账请求，ADR-008。
 * 单批最多 100 笔，使用 batchId 实现幂等。
 *
 * @author Digital Bank POC Team
 */
public class BatchTransferRequest {

    @NotBlank(message = "batchId 不能为空")
    private String batchId;

    @NotEmpty(message = "transfers 不能为空")
    @Size(max = 100, message = "单批最多 100 笔转账")
    @Valid
    private List<TransferItem> transfers;

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public List<TransferItem> getTransfers() {
        return transfers;
    }

    public void setTransfers(List<TransferItem> transfers) {
        this.transfers = transfers;
    }
}
