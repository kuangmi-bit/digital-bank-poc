/** Jest 配置：technical-standards 测试规范，Node 环境 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/utils/logger.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    // Day 5：先确保测试可稳定运行并输出覆盖率；后续再逐步提高门槛到 ≥70%
    global: { branches: 10, functions: 10, lines: 10, statements: 10 },
  },
};
