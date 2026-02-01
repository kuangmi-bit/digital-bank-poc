package com.digitalbank.core.service;

import com.digitalbank.core.dto.CreateCustomerRequest;
import com.digitalbank.core.dto.UpdateCustomerRequest;
import com.digitalbank.core.entity.Customer;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * CustomerService 单元测试：客户注册、查询、更新。
 *
 * @author Digital Bank POC Team
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    CustomerRepository customerRepository;

    @InjectMocks
    CustomerService customerService;

    Customer customer;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("张三");
        customer.setPhone("13800138000");
        customer.setEmail("zhangsan@example.com");
        customer.setStatus("active");
    }

    @Test
    void createCustomer_success() {
        CreateCustomerRequest req = new CreateCustomerRequest();
        req.setName("李四");
        req.setPhone("13900139000");
        req.setIdCard("110101199001011234");

        when(customerRepository.existsByIdCard("110101199001011234")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setId(2L);
            return c;
        });

        Customer got = customerService.createCustomer(req);

        assertThat(got.getId()).isEqualTo(2L);
        assertThat(got.getName()).isEqualTo("李四");
        assertThat(got.getPhone()).isEqualTo("13900139000");
        assertThat(got.getIdCard()).isEqualTo("110101199001011234");
        assertThat(got.getStatus()).isEqualTo("active");
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void createCustomer_throwsWhenIdCardExists() {
        CreateCustomerRequest req = new CreateCustomerRequest();
        req.setName("王五");
        req.setIdCard("110101199001011234");

        when(customerRepository.existsByIdCard("110101199001011234")).thenReturn(true);

        assertThatThrownBy(() -> customerService.createCustomer(req))
                .isInstanceOf(BusinessException.class)
                .hasMessage("身份证号已存在");
        verify(customerRepository, never()).save(any());
    }

    @Test
    void getCustomerById_success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        Customer got = customerService.getCustomerById(1L);

        assertThat(got.getId()).isEqualTo(1L);
        assertThat(got.getName()).isEqualTo("张三");
    }

    @Test
    void getCustomerById_throwsWhenNotFound() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getCustomerById(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("客户不存在");
    }

    @Test
    void updateCustomer_success() {
        UpdateCustomerRequest req = new UpdateCustomerRequest();
        req.setPhone("13700137000");
        req.setAddress("北京市朝阳区");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer got = customerService.updateCustomer(1L, req);

        assertThat(got.getPhone()).isEqualTo("13700137000");
        assertThat(got.getAddress()).isEqualTo("北京市朝阳区");
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void updateCustomer_throwsWhenNotFound() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.updateCustomer(999L, new UpdateCustomerRequest()))
                .isInstanceOf(BusinessException.class)
                .hasMessage("客户不存在");
        verify(customerRepository, never()).save(any());
    }
}
