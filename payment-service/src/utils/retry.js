/**
 * 通用重试工具（指数退避）
 * 遵循 technical-standards-v1.0 / ADR-006：最多 3 次，指数退避
 */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableError(err) {
  // 约定：status>=500 / 504 / 网络超时等可重试
  const status = err && (err.status || err.httpStatus);
  if (status === 504) return true;
  if (typeof status === 'number' && status >= 500) return true;
  const code = err && err.code;
  return ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND'].includes(code);
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{ maxRetries?: number, initialDelayMs?: number, maxDelayMs?: number }} [opts]
 * @returns {Promise<T>}
 */
async function retryableRequest(fn, opts = {}) {
  const maxRetries = opts.maxRetries ?? 3;
  let delay = opts.initialDelayMs ?? 500;
  const maxDelay = opts.maxDelayMs ?? 5000;

  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err) || attempt === maxRetries) {
        throw err;
      }
      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }
  // 理论不可达
  throw lastErr;
}

module.exports = {
  retryableRequest,
  isRetryableError,
};

