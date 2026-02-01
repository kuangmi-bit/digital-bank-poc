package com.digitalbank.core.repository;

import com.digitalbank.core.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 客户 Repository，表 customers。
 *
 * @author Digital Bank POC Team
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * 按身份证号查询
     */
    Optional<Customer> findByIdCard(String idCard);

    /**
     * 按手机号查询
     */
    Optional<Customer> findByPhone(String phone);

    /**
     * 按身份证号判断是否存在
     */
    boolean existsByIdCard(String idCard);
}
