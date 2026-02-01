package com.digitalbank.core.service;

import com.digitalbank.core.dto.CreateAccountRequest;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * AccountService 单元测试，覆盖开户、查询、余额、列表。
 *
 * @author Digital Bank POC Team
 */
@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    AccountRepository accountRepository;

    @Mock
    CustomerRepository customerRepository;

    @InjectMocks
    AccountService accountService;

    CreateAccountRequest createRequest;

    @BeforeEach
    void setUp() {
        createRequest = new CreateAccountRequest();
        createRequest.setCustomerId(1L);
        createRequest.setAccountType("savings");
    }

    @Test
    void createAccount_success() {
        when(customerRepository.existsById(1L)).thenReturn(true);
        when(accountRepository.existsByAccountNumber(any())).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> {
            Account a = inv.getArgument(0);
            a.setId(10L);
            a.setCreatedAt(Instant.now());
            a.setUpdatedAt(Instant.now());
            return a;
        });

        Account got = accountService.createAccount(createRequest);

        assertThat(got.getId()).isEqualTo(10L);
        assertThat(got.getAccountNumber()).startsWith("62");
        assertThat(got.getAccountNumber()).hasSize(16);
        assertThat(got.getCustomerId()).isEqualTo(1L);
        assertThat(got.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(got.getAccountType()).isEqualTo("savings");
        assertThat(got.getStatus()).isEqualTo("active");
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void createAccount_throwsWhenCustomerNotExists() {
        when(customerRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> accountService.createAccount(createRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("客户不存在");
        verify(accountRepository, never()).save(any());
    }

    @Test
    void getAccountById_success() {
        Account a = new Account();
        a.setId(1L);
        a.setAccountNumber("6200123456789012");
        a.setCustomerId(1L);
        a.setBalance(BigDecimal.TEN);
        a.setCurrency("CNY");
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

        Account got = accountService.getAccountById(1L);

        assertThat(got.getId()).isEqualTo(1L);
        assertThat(got.getAccountNumber()).isEqualTo("6200123456789012");
    }

    @Test
    void getAccountById_throwsWhenNotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccountById(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("账户不存在");
    }

    @Test
    void getBalance_success() {
        Account a = new Account();
        a.setId(2L);
        a.setBalance(new BigDecimal("100.50"));
        a.setCurrency("CNY");
        when(accountRepository.findById(2L)).thenReturn(Optional.of(a));

        var got = accountService.getBalance(2L);

        assertThat(got.getAccountId()).isEqualTo(2L);
        assertThat(got.getBalance()).isEqualByComparingTo("100.50");
        assertThat(got.getCurrency()).isEqualTo("CNY");
    }

    @Test
    void getBalance_throwsWhenNotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getBalance(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("账户不存在");
    }

    @Test
    void listAccounts_returnsPage() {
        Account a = new Account();
        a.setId(1L);
        a.setAccountNumber("6200123456789012");
        a.setCustomerId(1L);
        a.setBalance(BigDecimal.ZERO);
        a.setCurrency("CNY");
        a.setAccountType("savings");
        a.setStatus("active");
        a.setCreatedAt(Instant.now());
        a.setUpdatedAt(Instant.now());
        PageImpl<Account> page = new PageImpl<>(List.of(a), PageRequest.of(0, 20), 1);
        when(accountRepository.findByCustomerIdAndStatusOptional(any(), any(), any())).thenReturn(page);

        var got = accountService.listAccounts(null, null, 1, 20);

        assertThat(got.getItems()).hasSize(1);
        assertThat(got.getItems().get(0).getAccountId()).isEqualTo(1L);
        assertThat(got.getTotal()).isEqualTo(1);
        assertThat(got.getPage()).isEqualTo(1);
        assertThat(got.getPageSize()).isEqualTo(20);
    }
}
