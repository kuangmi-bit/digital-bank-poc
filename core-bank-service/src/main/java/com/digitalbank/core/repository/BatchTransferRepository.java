package com.digitalbank.core.repository;

import com.digitalbank.core.entity.BatchTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 批量转账记录仓储，ADR-008。
 *
 * @author Digital Bank POC Team
 */
@Repository
public interface BatchTransferRepository extends JpaRepository<BatchTransfer, Long> {

    /**
     * 根据 batchId 查询批量转账记录，用于幂等检查
     */
    Optional<BatchTransfer> findByBatchId(String batchId);
}
