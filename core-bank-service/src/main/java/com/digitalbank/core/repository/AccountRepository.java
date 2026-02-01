package com.digitalbank.core.repository;

import com.digitalbank.core.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 银行账户 Repository，表 bank_accounts。
 *
 * @author Digital Bank POC Team
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * 按 ID 加写锁查询（用于 debit/transfer 扣款、加款，避免并发覆盖）
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdForUpdate(@Param("id") Long id);

    /**
     * 按账号查询
     */
    Optional<Account> findByAccountNumber(String accountNumber);

    /**
     * 按客户ID分页查询
     */
    Page<Account> findByCustomerId(Long customerId, Pageable pageable);

    /**
     * 按客户ID与状态分页查询
     */
    Page<Account> findByCustomerIdAndStatus(Long customerId, String status, Pageable pageable);

    /**
     * 按状态分页查询
     */
    Page<Account> findByStatus(String status, Pageable pageable);

    /**
     * 按客户ID与状态查询是否存在
     */
    boolean existsByCustomerIdAndStatus(Long customerId, String status);

    /**
     * 按账号判断是否存在
     */
    boolean existsByAccountNumber(String accountNumber);

    /**
     * 按客户ID、状态可选分页查询；参数为 null 时该条件不过滤。
     */
    @Query("SELECT a FROM Account a WHERE (:customerId IS NULL OR a.customerId = :customerId) AND (:status IS NULL OR a.status = :status)")
    Page<Account> findByCustomerIdAndStatusOptional(@Param("customerId") Long customerId, @Param("status") String status, Pageable pageable);
}
