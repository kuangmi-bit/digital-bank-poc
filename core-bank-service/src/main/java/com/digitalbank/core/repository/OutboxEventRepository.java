package com.digitalbank.core.repository;

import com.digitalbank.core.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

/**
 * Outbox 仓储。
 */
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long>, OutboxEventRepositoryCustom {

    @Modifying
    @Query(value = "UPDATE outbox_events SET status='sent', sent_at=:now, updated_at=:now WHERE id=:id", nativeQuery = true)
    int markSent(@Param("id") long id, @Param("now") Instant now);

    @Modifying
    @Query(value = "UPDATE outbox_events SET status='pending', attempts=attempts+1, last_error=:err, updated_at=:now WHERE id=:id", nativeQuery = true)
    int markRetry(@Param("id") long id, @Param("err") String err, @Param("now") Instant now);

    @Modifying
    @Query(value = "UPDATE outbox_events SET status='failed', attempts=attempts+1, last_error=:err, updated_at=:now WHERE id=:id", nativeQuery = true)
    int markFailed(@Param("id") long id, @Param("err") String err, @Param("now") Instant now);
}

