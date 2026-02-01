package com.digitalbank.core.dto;

import java.util.List;

/**
 * 账户列表响应，与 OpenAPI AccountListResponse 一致。
 *
 * @author Digital Bank POC Team
 */
public class AccountListResponse {

    private List<AccountResponse> items;
    private long total;
    private int page;
    private int pageSize;

    public AccountListResponse() {}

    public AccountListResponse(List<AccountResponse> items, long total, int page, int pageSize) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<AccountResponse> getItems() { return items; }
    public void setItems(List<AccountResponse> items) { this.items = items; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
