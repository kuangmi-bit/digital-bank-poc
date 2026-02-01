package com.digitalbank.core.exception;

/**
 * 业务异常，对应技术标准规范中的错误码（如 CBB001、CBB006、CBV001）。
 * 由 {@link com.digitalbank.core.exception.GlobalExceptionHandler} 统一转换为 API 错误响应。
 *
 * @author Digital Bank POC Team
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;
    private final int httpStatus;

    public BusinessException(String errorCode, String message) {
        this(errorCode, message, resolveHttpStatus(errorCode));
    }

    public BusinessException(String errorCode, String message, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    private static int resolveHttpStatus(String code) {
        if (code == null) return 500;
        switch (code) {
            case "CBB001":
            case "CBB006":
                return 404;
            case "CBA001":
                return 401;
            case "CBA002":
                return 403;
            default:
                return (code.length() >= 3 && code.charAt(2) == 'S') ? 500 : 400;
        }
    }
}
