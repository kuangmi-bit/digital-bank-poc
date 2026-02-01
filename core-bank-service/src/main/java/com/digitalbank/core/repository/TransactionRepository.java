package com.digitalbank.core.repository;

import com.digitalbank.core.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/**
 * 交易 Repository，表 transactions。
 *
 * @author Digital Bank POC Team
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * 按业务流水号查询
     */
    Optional<Transaction> findByTransactionId(String transactionId);

    /**
     * 按幂等引用号查询（用于 debit 幂等，同一 refId 返回同一交易）
     */
    Optional<Transaction> findByRefId(String refId);

    /**
     * 按账户ID分页查询
     */
    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    /**
     * 按账户ID与状态分页查询
     */
    Page<Transaction> findByAccountIdAndStatus(Long accountId, String status, Pageable pageable);

    /**
     * 按账户ID与时间范围分页查询（交易历史）
     */
    Page<Transaction> findByAccountIdAndCreatedAtBetween(
            Long accountId, Instant from, Instant to, Pageable pageable);

    /**
     * 按账户ID分页查询（无时间范围）
     */
    Page<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    /**
     * 按业务流水号判断是否存在
     */
    boolean existsByTransactionId(String transactionId);

    /**
     * 按 accountId、status 可选分页查询（listTransactions）
     */
    @Query("SELECT t FROM Transaction t WHERE (:accountId IS NULL OR t.accountId = :accountId) AND (:status IS NULL OR t.status = :status)")
    Page<Transaction> findWithFilters(@Param("accountId") Long accountId, @Param("status") String status, Pageable pageable);
}
