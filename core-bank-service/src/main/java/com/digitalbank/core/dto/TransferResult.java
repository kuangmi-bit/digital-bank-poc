package com.digitalbank.core.dto;

/**
 * 批量转账中单笔的执行结果，ADR-008。
 *
 * @author Digital Bank POC Team
 */
public class TransferResult {

    private int index;
    private String transactionId;
    private String status;
    private String errorCode;
    private String message;

    public TransferResult() {
    }

    /**
     * 成功结果构造
     */
    public static TransferResult success(int index, String transactionId) {
        TransferResult r = new TransferResult();
        r.index = index;
        r.transactionId = transactionId;
        r.status = "completed";
        return r;
    }

    /**
     * 失败结果构造
     */
    public static TransferResult failed(int index, String errorCode, String message) {
        TransferResult r = new TransferResult();
        r.index = index;
        r.transactionId = null;
        r.status = "failed";
        r.errorCode = errorCode;
        r.message = message;
        return r;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
