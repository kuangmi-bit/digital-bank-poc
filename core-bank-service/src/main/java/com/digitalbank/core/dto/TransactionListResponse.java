package com.digitalbank.core.dto;

import java.util.List;

/**
 * 交易列表响应，与 OpenAPI TransactionListResponse 一致。
 *
 * @author Digital Bank POC Team
 */
public class TransactionListResponse {

    private List<TransactionResponse> items;
    private long total;
    private int page;
    private int pageSize;

    public TransactionListResponse(List<TransactionResponse> items, long total, int page, int pageSize) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<TransactionResponse> getItems() { return items; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getPageSize() { return pageSize; }
}
