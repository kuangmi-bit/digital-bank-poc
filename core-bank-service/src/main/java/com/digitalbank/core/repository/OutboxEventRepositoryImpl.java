package com.digitalbank.core.repository;

import com.digitalbank.core.entity.OutboxEvent;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Outbox 自定义仓储实现：使用 Postgres 的 FOR UPDATE SKIP LOCKED 领取任务。
 */
@Repository
public class OutboxEventRepositoryImpl implements OutboxEventRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public List<OutboxEvent> claimPending(int limit) {
        int safeLimit = Math.max(1, Math.min(200, limit));
        String sql = """
                WITH cte AS (
                  SELECT id
                  FROM outbox_events
                  WHERE status = 'pending'
                  ORDER BY created_at
                  FOR UPDATE SKIP LOCKED
                  LIMIT :limit
                )
                UPDATE outbox_events o
                SET status = 'processing', updated_at = NOW()
                FROM cte
                WHERE o.id = cte.id
                RETURNING o.*
                """;
        return em.createNativeQuery(sql, OutboxEvent.class)
                .setParameter("limit", safeLimit)
                .getResultList();
    }
}

