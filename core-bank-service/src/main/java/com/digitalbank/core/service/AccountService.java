package com.digitalbank.core.service;

import com.digitalbank.core.dto.*;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 账户服务：开户、查询账户、余额查询、列表查询。
 * 遵循 technical-standards、api-design-spec、data-dictionary。
 *
 * @author Digital Bank POC Team
 */
@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);
    private static final int ACCOUNT_NUMBER_RETRY = 5;

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;

    public AccountService(AccountRepository accountRepository, CustomerRepository customerRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }

    /**
     * 开户。校验客户存在，生成唯一账号并持久化。
     *
     * @param request 开户请求（customerId、accountType、currency）
     * @return 创建后的账户
     * @throws BusinessException CBB006 客户不存在；CBV001/CBV003 校验失败
     */
    @Transactional
    public Account createAccount(CreateAccountRequest request) {
        Long customerId = request.getCustomerId();
        log.info("创建账户开始, customerId={}, accountType={}", customerId, request.getAccountType());

        if (!customerRepository.existsById(customerId)) {
            log.warn("开户失败: 客户不存在, customerId={}", customerId);
            throw new BusinessException("CBB006", "客户不存在", 404);
        }

        String accountNumber = generateUniqueAccountNumber();
        String currency = request.getCurrency() != null && !request.getCurrency().isBlank() ? request.getCurrency() : "CNY";

        Account account = new Account();
        account.setAccountNumber(accountNumber);
        account.setCustomerId(customerId);
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency(currency);
        account.setAccountType(request.getAccountType().toLowerCase());
        account.setStatus("active");

        account = accountRepository.save(account);
        log.info("账户创建成功, accountId={}, accountNumber={}", account.getId(), account.getAccountNumber());
        return account;
    }

    /**
     * 按 ID 查询账户。
     *
     * @param id 账户 ID
     * @return 账户实体
     * @throws BusinessException CBB001 账户不存在
     */
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("账户不存在, accountId={}", id);
                    return new BusinessException("CBB001", "账户不存在", 404);
                });
    }

    /**
     * 余额查询。
     *
     * @param id 账户 ID
     * @return 余额响应（accountId、balance、currency）
     * @throws BusinessException CBB001 账户不存在
     */
    public BalanceResponse getBalance(Long id) {
        Account a = getAccountById(id);
        return new BalanceResponse(a.getId(), a.getBalance(), a.getCurrency());
    }

    /**
     * 分页查询账户列表，支持按 customerId、status 过滤。
     *
     * @param customerId 客户 ID，可选
     * @param status     状态，可选
     * @param page       页码，从 1 起
     * @param pageSize   每页条数
     * @return 列表响应（items、total、page、pageSize）
     */
    public AccountListResponse listAccounts(Long customerId, String status, int page, int pageSize) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, pageSize)),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Account> slice = accountRepository.findByCustomerIdAndStatusOptional(customerId, status, p);
        List<AccountResponse> items = slice.getContent().stream().map(AccountResponse::from).collect(Collectors.toList());
        return new AccountListResponse(items, slice.getTotalElements(), slice.getNumber() + 1, slice.getSize());
    }

    private String generateUniqueAccountNumber() {
        for (int i = 0; i < ACCOUNT_NUMBER_RETRY; i++) {
            String cand = "62" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            if (!accountRepository.existsByAccountNumber(cand)) {
                return cand;
            }
            log.debug("账号冲突，重试生成: attempt={}", i + 1);
        }
        throw new BusinessException("CBS001", "生成账号失败，请重试", 500);
    }
}
