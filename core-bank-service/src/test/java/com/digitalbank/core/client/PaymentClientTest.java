package com.digitalbank.core.client;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PaymentClientTest {

    @Test
    void sendCallback_success() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();

        PaymentClient client = new HttpPaymentClient(restTemplate, "http://payment-service");

        server.expect(requestTo("http://payment-service/api/v1/payments/callback"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        PaymentCallbackRequestDto req = new PaymentCallbackRequestDto();
        req.setPaymentId("pay-001");
        req.setStatus("completed");
        req.setGatewayOrderId("tx-001");
        req.setCode("CB000");
        req.setMessage("ok");

        client.sendCallback(req);
        server.verify();
    }
}

