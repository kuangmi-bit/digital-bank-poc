package com.digitalbank.core.dto;

import java.util.List;

/**
 * 预约转账列表响应，ADR-008。
 *
 * @author Digital Bank POC Team
 */
public class ScheduledTransferListResponse {

    private List<ScheduledTransferResponse> items;
    private long total;
    private int page;
    private int pageSize;

    public ScheduledTransferListResponse() {
    }

    public ScheduledTransferListResponse(List<ScheduledTransferResponse> items, long total, int page, int pageSize) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<ScheduledTransferResponse> getItems() {
        return items;
    }

    public void setItems(List<ScheduledTransferResponse> items) {
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}
