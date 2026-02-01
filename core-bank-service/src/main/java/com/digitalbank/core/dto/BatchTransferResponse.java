package com.digitalbank.core.dto;

import java.util.List;

/**
 * 批量转账响应，ADR-008。
 * 包含总数、成功数、失败数及每笔结果。
 *
 * @author Digital Bank POC Team
 */
public class BatchTransferResponse {

    private String batchId;
    private int totalCount;
    private int successCount;
    private int failedCount;
    private List<TransferResult> results;

    public BatchTransferResponse() {
    }

    public BatchTransferResponse(String batchId, int totalCount, int successCount, int failedCount, List<TransferResult> results) {
        this.batchId = batchId;
        this.totalCount = totalCount;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.results = results;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public List<TransferResult> getResults() {
        return results;
    }

    public void setResults(List<TransferResult> results) {
        this.results = results;
    }
}
