/**
 * 支付业务错误
 * 遵循 technical-standards-v1.0 错误码（PY*）、api-design-spec-v1.0
 */

class PaymentError extends Error {
  constructor(errorCode, message, httpStatus = 500, errors = null) {
    super(message);
    this.name = 'PaymentError';
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
    this.errors = Array.isArray(errors) ? errors : null;
  }
}

module.exports = { PaymentError };
