package com.digitalbank.core.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

import static com.digitalbank.core.client.ClientHeaderUtil.HDR_CALLER_SERVICE;
import static com.digitalbank.core.client.ClientHeaderUtil.HDR_REQUEST_ID;
import static com.digitalbank.core.client.ClientHeaderUtil.HDR_TRACE_ID;

/**
 * 请求链路追踪 Filter：
 * - 从 header 读取 traceId/requestId/callerService，不存在则生成
 * - 写入 MDC，便于日志统一输出与下游调用透传
 * - 回写响应 header（便于调用方串联排查）
 */
@Component
public class RequestTracingFilter extends OncePerRequestFilter {

    private static final String DEFAULT_CALLER = "external";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String traceId = headerOrNull(request, HDR_TRACE_ID);
        String requestId = headerOrNull(request, HDR_REQUEST_ID);
        String callerService = headerOrNull(request, HDR_CALLER_SERVICE);

        if (traceId == null || traceId.isBlank()) traceId = genId();
        if (requestId == null || requestId.isBlank()) requestId = genId();
        if (callerService == null || callerService.isBlank()) callerService = DEFAULT_CALLER;

        MDC.put("traceId", traceId);
        MDC.put("requestId", requestId);
        MDC.put("callerService", callerService);

        response.setHeader(HDR_TRACE_ID, traceId);
        response.setHeader(HDR_REQUEST_ID, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("traceId");
            MDC.remove("requestId");
            MDC.remove("callerService");
        }
    }

    private static String headerOrNull(HttpServletRequest request, String name) {
        String v = request.getHeader(name);
        return v == null ? null : v.trim();
    }

    private static String genId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}

