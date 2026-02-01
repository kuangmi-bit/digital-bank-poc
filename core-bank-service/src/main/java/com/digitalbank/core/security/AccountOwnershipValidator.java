package com.digitalbank.core.security;

import com.digitalbank.core.entity.Account;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Set;

/**
 * 账户归属校验器，Day 11 安全加固。
 * 确保用户只能操作属于自己的账户。
 *
 * 遵循 Day 9 安全复核报告建议：在业务层增加 customerId 校验。
 *
 * @author Digital Bank POC Team
 */
@Component
public class AccountOwnershipValidator {

    private static final Logger log = LoggerFactory.getLogger(AccountOwnershipValidator.class);

    private final AccountRepository accountRepository;

    public AccountOwnershipValidator(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * 校验账户是否属于指定客户。
     *
     * @param accountId  账户 ID
     * @param customerId 客户 ID
     * @throws BusinessException CBB006 无权操作此账户
     */
    public void validateOwnership(Long accountId, Long customerId) {
        if (accountId == null || customerId == null) {
            log.warn("账户归属校验失败: 参数为空, accountId={}, customerId={}", accountId, customerId);
            throw new BusinessException("CBB006", "无权操作此账户", 403);
        }

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) {
            log.warn("账户归属校验失败: 账户不存在, accountId={}", accountId);
            throw new BusinessException("CBB001", "账户不存在", 404);
        }

        if (!customerId.equals(account.getCustomerId())) {
            log.warn("账户归属校验失败: 账户不属于当前客户, accountId={}, customerId={}, ownerId={}",
                    accountId, customerId, account.getCustomerId());
            throw new BusinessException("CBB006", "无权操作此账户", 403);
        }

        log.debug("账户归属校验通过, accountId={}, customerId={}", accountId, customerId);
    }

    /**
     * 校验多个账户是否属于指定客户（批量转账场景）。
     *
     * @param accountIds 账户 ID 集合
     * @param customerId 客户 ID
     * @throws BusinessException CBB006 无权操作此账户
     */
    public void validateOwnershipBatch(Collection<Long> accountIds, Long customerId) {
        if (accountIds == null || accountIds.isEmpty()) {
            return;
        }
        for (Long accountId : accountIds) {
            validateOwnership(accountId, customerId);
        }
    }

    /**
     * 校验转出账户是否属于指定客户（转账场景，只校验转出账户）。
     *
     * @param fromAccountId 转出账户 ID
     * @param customerId    客户 ID
     * @throws BusinessException CBB006 无权操作此账户
     */
    public void validateTransferSource(Long fromAccountId, Long customerId) {
        validateOwnership(fromAccountId, customerId);
    }

    /**
     * 获取账户所属客户 ID。
     *
     * @param accountId 账户 ID
     * @return 客户 ID，账户不存在返回 null
     */
    public Long getAccountOwnerId(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return accountRepository.findById(accountId)
                .map(Account::getCustomerId)
                .orElse(null);
    }

    /**
     * 检查账户是否属于指定客户（不抛异常）。
     *
     * @param accountId  账户 ID
     * @param customerId 客户 ID
     * @return true 属于，false 不属于或账户不存在
     */
    public boolean isOwnedBy(Long accountId, Long customerId) {
        if (accountId == null || customerId == null) {
            return false;
        }
        return accountRepository.findById(accountId)
                .map(a -> customerId.equals(a.getCustomerId()))
                .orElse(false);
    }
}
