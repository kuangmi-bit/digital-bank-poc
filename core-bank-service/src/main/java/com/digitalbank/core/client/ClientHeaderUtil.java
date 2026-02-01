package com.digitalbank.core.client;

import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

/**
 * 服务间调用 header 构造工具：透传 trace/request/caller 信息。
 */
public final class ClientHeaderUtil {

    private ClientHeaderUtil() {}

    public static final String HDR_TRACE_ID = "X-Trace-ID";
    public static final String HDR_REQUEST_ID = "X-Request-ID";
    public static final String HDR_CALLER_SERVICE = "X-Caller-Service";

    public static HttpHeaders jsonHeaders(String defaultCallerService) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String traceId = MDC.get("traceId");
        String requestId = MDC.get("requestId");
        String callerService = MDC.get("callerService");

        if (traceId != null && !traceId.isBlank()) headers.set(HDR_TRACE_ID, traceId);
        if (requestId != null && !requestId.isBlank()) headers.set(HDR_REQUEST_ID, requestId);

        String caller = (callerService != null && !callerService.isBlank()) ? callerService : defaultCallerService;
        if (caller != null && !caller.isBlank()) headers.set(HDR_CALLER_SERVICE, caller);

        return headers;
    }
}

