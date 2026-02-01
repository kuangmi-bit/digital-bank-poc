package com.digitalbank.core.repository;

import com.digitalbank.core.entity.ScheduledTransfer;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * 预约转账仓储，ADR-008。
 *
 * @author Digital Bank POC Team
 */
@Repository
public interface ScheduledTransferRepository extends JpaRepository<ScheduledTransfer, Long> {

    /**
     * 根据 scheduledId 查询预约
     */
    Optional<ScheduledTransfer> findByScheduledId(String scheduledId);

    /**
     * 根据 scheduledId 加锁查询（防止重复执行）
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ScheduledTransfer s WHERE s.scheduledId = :scheduledId")
    Optional<ScheduledTransfer> findByScheduledIdForUpdate(@Param("scheduledId") String scheduledId);

    /**
     * 查询到期待执行的预约（pending 且时间已到）
     */
    @Query("SELECT s FROM ScheduledTransfer s WHERE s.status = 'pending' AND s.scheduledTime <= :now")
    List<ScheduledTransfer> findDueTransfers(@Param("now") Instant now);

    /**
     * 根据账户和状态查询预约列表
     */
    @Query("SELECT s FROM ScheduledTransfer s WHERE s.fromAccountId = :accountId AND (:status IS NULL OR s.status = :status) ORDER BY s.scheduledTime DESC")
    Page<ScheduledTransfer> findByFromAccountIdAndStatus(@Param("accountId") Long accountId, @Param("status") String status, Pageable pageable);

    /**
     * 根据账户查询所有预约列表
     */
    Page<ScheduledTransfer> findByFromAccountIdOrderByScheduledTimeDesc(Long fromAccountId, Pageable pageable);
}
