package com.digitalbank.core.repository;

import com.digitalbank.core.entity.OutboxEvent;

import java.util.List;

/**
 * Outbox 自定义仓储：用于「领取」待处理事件（FOR UPDATE SKIP LOCKED）。
 */
public interface OutboxEventRepositoryCustom {

    /**
     * 领取一批待处理事件：将 pending -> processing，并返回领取到的事件列表。
     * 需要在事务内调用。
     */
    List<OutboxEvent> claimPending(int limit);
}

