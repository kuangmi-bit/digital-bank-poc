package com.digitalbank.core.service;

import com.digitalbank.core.client.RiskClient;
import com.digitalbank.core.dto.DebitRequest;
import com.digitalbank.core.dto.DebitResponse;
import com.digitalbank.core.dto.TransferRequest;
import com.digitalbank.core.dto.TransferResponse;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.entity.Transaction;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.TransactionRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * TransactionService 单元测试：debit（含幂等）、transfer、listTransactions、getTransactionHistory。
 *
 * @author Digital Bank POC Team
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    AccountRepository accountRepository;

    @Mock
    TransactionRepository transactionRepository;

    @Mock
    RiskClient riskClient;

    @Mock
    OutboxService outboxService;

    @InjectMocks
    TransactionService transactionService;

    Account account;

    @BeforeEach
    void setUp() {
        account = new Account();
        account.setId(1L);
        account.setAccountNumber("6200123456789012");
        account.setCustomerId(10L);
        account.setBalance(new BigDecimal("100.00"));
        account.setStatus("active");
    }

    @Test
    void debit_success() {
        DebitRequest req = new DebitRequest();
        req.setAccountId(1L);
        req.setAmount(new BigDecimal("10.00"));
        req.setRefId("pay-ref-001");
        req.setRemark("test");

        when(transactionRepository.findByRefId("pay-ref-001")).thenReturn(Optional.empty());
        when(accountRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

        DebitResponse res = transactionService.debit(req);

        assertThat(res.getTransactionId()).isNotNull();
        assertThat(res.getAccountId()).isEqualTo(1L);
        assertThat(res.getAmount()).isEqualByComparingTo("10.00");
        assertThat(res.getStatus()).isEqualTo("completed");
        assertThat(account.getBalance()).isEqualByComparingTo("90.00");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void debit_idempotent_sameRefIdReturnsSameTransactionId() {
        Transaction existing = new Transaction();
        existing.setTransactionId("tx-existing-001");
        existing.setAccountId(1L);
        existing.setAmount(new BigDecimal("10.00"));
        existing.setStatus("completed");

        DebitRequest req = new DebitRequest();
        req.setAccountId(1L);
        req.setAmount(new BigDecimal("10.00"));
        req.setRefId("pay-ref-001");

        when(transactionRepository.findByRefId("pay-ref-001")).thenReturn(Optional.of(existing));

        DebitResponse res = transactionService.debit(req);

        assertThat(res.getTransactionId()).isEqualTo("tx-existing-001");
        assertThat(res.getAccountId()).isEqualTo(1L);
        assertThat(res.getAmount()).isEqualByComparingTo("10.00");
        assertThat(res.getStatus()).isEqualTo("completed");
        verify(accountRepository, never()).findByIdForUpdate(anyLong());
        verify(accountRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void debit_throwsWhenAccountNotFound() {
        DebitRequest req = new DebitRequest();
        req.setAccountId(999L);
        req.setAmount(new BigDecimal("10.00"));
        req.setRefId("pay-ref-002");

        when(transactionRepository.findByRefId("pay-ref-002")).thenReturn(Optional.empty());
        when(accountRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.debit(req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("账户不存在");
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void debit_throwsWhenInsufficientBalance() {
        account.setBalance(new BigDecimal("5.00"));
        DebitRequest req = new DebitRequest();
        req.setAccountId(1L);
        req.setAmount(new BigDecimal("10.00"));
        req.setRefId("pay-ref-003");

        when(transactionRepository.findByRefId("pay-ref-003")).thenReturn(Optional.empty());
        when(accountRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> transactionService.debit(req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("余额不足");
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void debit_throwsWhenAccountFrozen() {
        account.setStatus("frozen");
        DebitRequest req = new DebitRequest();
        req.setAccountId(1L);
        req.setAmount(new BigDecimal("10.00"));
        req.setRefId("pay-ref-004");

        when(transactionRepository.findByRefId("pay-ref-004")).thenReturn(Optional.empty());
        when(accountRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> transactionService.debit(req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("账户已冻结");
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_success() {
        Account to = new Account();
        to.setId(2L);
        to.setCustomerId(20L);
        to.setBalance(BigDecimal.ZERO);
        to.setStatus("active");

        TransferRequest req = new TransferRequest();
        req.setFromAccountId(1L);
        req.setToAccountId(2L);
        req.setAmount(new BigDecimal("30.00"));
        req.setRemark("transfer test");

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(account));
        when(accountRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(to));
        when(accountRepository.save(any(Account.class))).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

        TransferResponse res = transactionService.transfer(req);

        assertThat(res.getTransactionId()).startsWith("TX");
        assertThat(res.getFromAccountId()).isEqualTo(1L);
        assertThat(res.getToAccountId()).isEqualTo(2L);
        assertThat(res.getAmount()).isEqualByComparingTo("30.00");
        assertThat(res.getStatus()).isEqualTo("completed");
        assertThat(account.getBalance()).isEqualByComparingTo("70.00");
        assertThat(to.getBalance()).isEqualByComparingTo("30.00");
        verify(riskClient).checkTransfer(10L, 1L, new BigDecimal("30.00"), 2L);
        verify(transactionRepository, org.mockito.Mockito.times(2)).save(any(Transaction.class));
    }

    @Test
    void transfer_throwsWhenSameAccount() {
        TransferRequest req = new TransferRequest();
        req.setFromAccountId(1L);
        req.setToAccountId(1L);
        req.setAmount(new BigDecimal("10.00"));

        assertThatThrownBy(() -> transactionService.transfer(req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("同账户转账");
        verify(riskClient, never()).checkTransfer(anyLong(), anyLong(), any(), any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void listTransactions_returnsPage() {
        Transaction t = new Transaction();
        t.setTransactionId("tx-1");
        t.setAccountId(1L);
        t.setAmount(new BigDecimal("10.00"));
        t.setTransactionType("payment");
        t.setStatus("completed");
        t.setCreatedAt(Instant.now());
        PageImpl<Transaction> page = new PageImpl<>(List.of(t), PageRequest.of(0, 20), 1);
        when(transactionRepository.findWithFilters(eq(1L), isNull(), any())).thenReturn(page);

        var res = transactionService.listTransactions(1L, null, 1, 20);

        assertThat(res.getItems()).hasSize(1);
        assertThat(res.getItems().get(0).getTransactionId()).isEqualTo("tx-1");
        assertThat(res.getTotal()).isEqualTo(1);
        assertThat(res.getPage()).isEqualTo(1);
        assertThat(res.getPageSize()).isEqualTo(20);
    }

    @Test
    void getTransactionHistory_returnsPage() {
        Transaction t = new Transaction();
        t.setTransactionId("tx-h1");
        t.setAccountId(1L);
        t.setAmount(new BigDecimal("5.00"));
        t.setTransactionType("payment");
        t.setStatus("completed");
        t.setCreatedAt(Instant.now());
        PageImpl<Transaction> page = new PageImpl<>(List.of(t), PageRequest.of(0, 20), 1);
        when(transactionRepository.findByAccountIdOrderByCreatedAtDesc(eq(1L), any())).thenReturn(page);

        var res = transactionService.getTransactionHistory(1L, null, null, 1, 20);

        assertThat(res.getItems()).hasSize(1);
        assertThat(res.getItems().get(0).getTransactionId()).isEqualTo("tx-h1");
    }
}
