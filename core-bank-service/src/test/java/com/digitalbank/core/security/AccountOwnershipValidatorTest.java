package com.digitalbank.core.security;

import com.digitalbank.core.entity.Account;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * 账户归属校验器单元测试，Day 11。
 */
@ExtendWith(MockitoExtension.class)
class AccountOwnershipValidatorTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountOwnershipValidator validator;

    private Account testAccount;

    @BeforeEach
    void setUp() {
        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setCustomerId(100L);
        testAccount.setAccountNumber("6212345678901234");
    }

    @Test
    @DisplayName("校验通过：账户属于当前客户")
    void validateOwnership_Success() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        assertDoesNotThrow(() -> validator.validateOwnership(1L, 100L));
    }

    @Test
    @DisplayName("校验失败：账户不属于当前客户")
    void validateOwnership_WrongCustomer() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> validator.validateOwnership(1L, 200L));
        assertEquals("CBB006", ex.getErrorCode());
        assertEquals(403, ex.getHttpStatus());
    }

    @Test
    @DisplayName("校验失败：账户不存在")
    void validateOwnership_AccountNotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> validator.validateOwnership(999L, 100L));
        assertEquals("CBB001", ex.getErrorCode());
        assertEquals(404, ex.getHttpStatus());
    }

    @Test
    @DisplayName("校验失败：参数为空")
    void validateOwnership_NullParams() {
        BusinessException ex1 = assertThrows(BusinessException.class,
                () -> validator.validateOwnership(null, 100L));
        assertEquals("CBB006", ex1.getErrorCode());

        BusinessException ex2 = assertThrows(BusinessException.class,
                () -> validator.validateOwnership(1L, null));
        assertEquals("CBB006", ex2.getErrorCode());
    }

    @Test
    @DisplayName("批量校验：所有账户属于同一客户")
    void validateOwnershipBatch_Success() {
        Account account2 = new Account();
        account2.setId(2L);
        account2.setCustomerId(100L);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account2));

        assertDoesNotThrow(() ->
                validator.validateOwnershipBatch(Arrays.asList(1L, 2L), 100L));
    }

    @Test
    @DisplayName("批量校验：其中一个账户不属于当前客户")
    void validateOwnershipBatch_OneFails() {
        Account account2 = new Account();
        account2.setId(2L);
        account2.setCustomerId(200L); // 不同客户

        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account2));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> validator.validateOwnershipBatch(Arrays.asList(1L, 2L), 100L));
        assertEquals("CBB006", ex.getErrorCode());
    }

    @Test
    @DisplayName("检查账户归属：返回 true")
    void isOwnedBy_True() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        assertTrue(validator.isOwnedBy(1L, 100L));
    }

    @Test
    @DisplayName("检查账户归属：返回 false")
    void isOwnedBy_False() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        assertFalse(validator.isOwnedBy(1L, 200L));
    }

    @Test
    @DisplayName("检查账户归属：账户不存在返回 false")
    void isOwnedBy_AccountNotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertFalse(validator.isOwnedBy(999L, 100L));
    }

    @Test
    @DisplayName("获取账户所有者 ID")
    void getAccountOwnerId_Success() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        assertEquals(100L, validator.getAccountOwnerId(1L));
    }

    @Test
    @DisplayName("获取账户所有者 ID：账户不存在返回 null")
    void getAccountOwnerId_NotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertNull(validator.getAccountOwnerId(999L));
    }
}
