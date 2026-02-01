package com.digitalbank.core.service;

import com.digitalbank.core.dto.CreateCustomerRequest;
import com.digitalbank.core.dto.CustomerResponse;
import com.digitalbank.core.dto.UpdateCustomerRequest;
import com.digitalbank.core.entity.Customer;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 客户服务：客户注册、客户信息查询、客户信息更新。
 *
 * @author Digital Bank POC Team
 */
@Service
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * 客户注册。
     *
     * @throws BusinessException CBB009 冲突（如身份证号已存在）
     */
    @Transactional
    public Customer createCustomer(CreateCustomerRequest request) {
        log.info("客户注册开始, name={}", request.getName());

        if (request.getIdCard() != null && !request.getIdCard().isBlank()
                && customerRepository.existsByIdCard(request.getIdCard().trim())) {
            log.warn("客户注册失败: 身份证号已存在, idCard={}", request.getIdCard());
            throw new BusinessException("CBB009", "身份证号已存在", 409);
        }

        Customer c = new Customer();
        c.setName(request.getName().trim());
        c.setIdCard(request.getIdCard() != null && !request.getIdCard().isBlank() ? request.getIdCard().trim() : null);
        c.setPhone(request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone().trim() : null);
        c.setEmail(request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail().trim() : null);
        c.setAddress(request.getAddress() != null && !request.getAddress().isBlank() ? request.getAddress().trim() : null);
        c.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus().trim().toLowerCase() : "active");

        c = customerRepository.save(c);
        log.info("客户注册成功, customerId={}", c.getId());
        return c;
    }

    /**
     * 客户信息查询。
     *
     * @throws BusinessException CBB006 客户不存在
     */
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("客户不存在, customerId={}", id);
                    return new BusinessException("CBB006", "客户不存在", 404);
                });
    }

    /**
     * 客户信息更新。
     *
     * @throws BusinessException CBB006 客户不存在；CBB009 冲突（如身份证号重复）
     */
    @Transactional
    public Customer updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer c = getCustomerById(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            c.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            c.setPhone(request.getPhone().isBlank() ? null : request.getPhone().trim());
        }
        if (request.getEmail() != null) {
            c.setEmail(request.getEmail().isBlank() ? null : request.getEmail().trim());
        }
        if (request.getAddress() != null) {
            c.setAddress(request.getAddress().isBlank() ? null : request.getAddress().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            c.setStatus(request.getStatus().trim().toLowerCase());
        }

        c = customerRepository.save(c);
        log.info("客户更新成功, customerId={}", id);
        return c;
    }
}
