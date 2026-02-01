package com.digitalbank.core.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 全局异常处理，将业务异常与校验异常转换为 api-design-spec 规定的统一错误响应。
 * 遵循 technical-standards-v1.0 错误处理规范。
 *
 * @author Digital Bank POC Team
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorBody> handleBusinessException(BusinessException ex, HttpServletRequest req) {
        log.warn("业务异常: errorCode={}, message={}, path={}", ex.getErrorCode(), ex.getMessage(), req.getRequestURI());
        ErrorBody body = ErrorBody.builder()
                .code(ex.getHttpStatus())
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode())
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.status(ex.getHttpStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<FieldErr> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new FieldErr(f.getField(), f.getDefaultMessage()))
                .collect(Collectors.toList());
        log.warn("参数校验失败: path={}, errors={}", req.getRequestURI(), errors);
        ErrorBody body = ErrorBody.builder()
                .code(400)
                .message("请求参数校验失败")
                .errorCode("CBV003")
                .errors(errors)
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorBody> handleBind(BindException ex, HttpServletRequest req) {
        List<FieldErr> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new FieldErr(f.getField(), f.getDefaultMessage()))
                .collect(Collectors.toList());
        ErrorBody body = ErrorBody.builder()
                .code(400)
                .message("请求参数错误")
                .errorCode("CBV003")
                .errors(errors)
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler({ MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class })
    public ResponseEntity<ErrorBody> handleBadRequest(Exception ex, HttpServletRequest req) {
        log.warn("请求格式错误: path={}, ex={}", req.getRequestURI(), ex.getMessage());
        ErrorBody body = ErrorBody.builder()
                .code(400)
                .message(ex.getMessage() != null ? ex.getMessage() : "请求参数格式错误")
                .errorCode("CBV003")
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorBody> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("数据约束冲突: path={}, ex={}", req.getRequestURI(), ex.getMessage());
        ErrorBody body = ErrorBody.builder()
                .code(409)
                .message("数据冲突，请检查唯一性约束")
                .errorCode("CBB009")
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorBody> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest req) {
        log.warn("参数约束违规: path={}, ex={}", req.getRequestURI(), ex.getMessage());
        ErrorBody body = ErrorBody.builder()
                .code(400)
                .message("请求参数校验失败")
                .errorCode("CBV003")
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorBody> handleIllegalArg(IllegalArgumentException ex, HttpServletRequest req) {
        log.warn("非法参数: path={}, ex={}", req.getRequestURI(), ex.getMessage());
        ErrorBody body = ErrorBody.builder()
                .code(400)
                .message(ex.getMessage() != null ? ex.getMessage() : "请求参数错误")
                .errorCode("CBV003")
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("未处理异常: path=" + req.getRequestURI(), ex);
        ErrorBody body = ErrorBody.builder()
                .code(500)
                .message("服务内部错误")
                .errorCode("CBS001")
                .timestamp(Instant.now().toString())
                .path(req.getRequestURI())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    // --- 响应体（手写以兼容未启用 Lombok 注解处理的编译环境）---

    public static class ErrorBody {
        private int code;
        private String message;
        private String errorCode;
        private List<FieldErr> errors;
        private String timestamp;
        private String path;

        public static Builder builder() {
            return new Builder();
        }

        public int getCode() { return code; }
        public String getMessage() { return message; }
        public String getErrorCode() { return errorCode; }
        public List<FieldErr> getErrors() { return errors != null ? errors : Collections.emptyList(); }
        public String getTimestamp() { return timestamp; }
        public String getPath() { return path; }

        public static class Builder {
            private int code;
            private String message;
            private String errorCode;
            private List<FieldErr> errors = Collections.emptyList();
            private String timestamp;
            private String path;

            public Builder code(int c) { this.code = c; return this; }
            public Builder message(String m) { this.message = m; return this; }
            public Builder errorCode(String e) { this.errorCode = e; return this; }
            public Builder errors(List<FieldErr> e) { this.errors = e != null ? e : Collections.emptyList(); return this; }
            public Builder timestamp(String t) { this.timestamp = t; return this; }
            public Builder path(String p) { this.path = p; return this; }

            public ErrorBody build() {
                ErrorBody b = new ErrorBody();
                b.code = this.code;
                b.message = this.message;
                b.errorCode = this.errorCode;
                b.errors = this.errors;
                b.timestamp = this.timestamp;
                b.path = this.path;
                return b;
            }
        }
    }

    public static class FieldErr {
        private final String field;
        private final String message;

        public FieldErr(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() { return field; }
        public String getMessage() { return message; }
    }
}
