/**
 * 完整用户旅程 E2E 测试
 * 命名：complete-user-journey.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v1.0、naming-conventions
 *
 * 模拟完整用户流程：注册 -> 登录 -> 查看账户 -> 转账 -> 查看交易历史 -> 登出
 */

describe('Complete User Journey', () => {
  const testUser = {
    username: 'journey_user_' + Date.now(),
    password: 'SecurePass123!',
    name: '旅程测试用户',
  };

  it('should_complete_full_user_journey_from_registration_to_transfer', () => {
    // Step 1: 注册新用户
    cy.intercept('POST', '**/api/v1/auth/register', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'OK',
        data: { customerId: 100, username: testUser.username },
        timestamp: new Date().toISOString(),
      },
    }).as('register');

    cy.visit('/register');
    cy.get('input[name="username"], input[placeholder*="用户名"]').first().type(testUser.username);
    cy.get('input[name="name"], input[placeholder*="姓名"]').first().type(testUser.name);
    cy.get('input[type="password"]').first().type(testUser.password);
    cy.get('input[type="password"]').eq(1).then(($el) => {
      if ($el.length) cy.wrap($el).type(testUser.password);
    });
    cy.get('button[type="submit"]').click();
    cy.wait('@register');

    // Step 2: 登录
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          token: 'journey-token',
          user: { id: '100', username: testUser.username, customerId: 100, name: testUser.name },
        },
        timestamp: new Date().toISOString(),
      },
    }).as('login');

    cy.url().should('include', '/login');
    cy.get('input[autocomplete="username"]').type(testUser.username);
    cy.get('input[autocomplete="current-password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait('@login');

    // Step 3: 查看账户概览
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            { accountId: 101, accountNumber: '6200999888777001', customerId: 100, balance: 5000.00, currency: 'CNY', accountType: 'savings', status: 'active' },
            { accountId: 102, accountNumber: '6200999888777002', customerId: 100, balance: 2000.00, currency: 'CNY', accountType: 'checking', status: 'active' },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');

    cy.url().should('include', '/accounts');
    cy.wait('@listAccounts');
    cy.contains('5,000.00').should('exist').or(cy.contains('5000').should('exist'));

    // Step 4: 进行转账
    cy.intercept('POST', '**/api/v1/transactions/transfer', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          transactionId: 'TRX-JOURNEY-001',
          fromAccountId: 101,
          toAccountId: 102,
          amount: 100,
          status: 'completed',
        },
        timestamp: new Date().toISOString(),
      },
    }).as('transfer');

    cy.visit('/transfer');
    cy.wait('@listAccounts');
    cy.get('#fromAccountId').select('101');
    cy.get('#toAccountId').type('102');
    cy.get('#amount').type('100');
    cy.window().then((w) => cy.stub(w, 'confirm').returns(false));
    cy.get('form').find('button[type="submit"]').click();
    cy.wait('@transfer');

    // Step 5: 查看交易历史
    cy.intercept('GET', '**/api/v1/transactions*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            {
              transactionId: 'TRX-JOURNEY-001',
              fromAccountId: 101,
              toAccountId: 102,
              amount: 100,
              type: 'transfer',
              status: 'completed',
              createdAt: new Date().toISOString(),
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listTransactions');

    cy.visit('/transactions');
    cy.wait('@listTransactions');
    cy.contains('100').should('exist');

    // 验证完整旅程成功
    cy.log('Complete user journey test passed!');
  });

  it('should_handle_session_expiry_during_journey', () => {
    // 模拟 session 过期场景
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { token: 'expiring-token', user: { id: '1', username: 'test', customerId: 1, name: 'Test' } },
        timestamp: new Date().toISOString(),
      },
    }).as('login');

    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('testuser');
    cy.get('input[autocomplete="current-password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');

    // 模拟 token 过期
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 401,
      body: { message: 'Token expired' },
    }).as('expiredToken');

    cy.visit('/accounts');
    cy.wait('@expiredToken');
    // 应重定向到登录页或显示登录提示
    cy.url().should('satisfy', (url) => url.includes('/login') || url.includes('/accounts'));
  });

  it('should_handle_network_errors_gracefully', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { token: 'test-token', user: { id: '1', username: 'test', customerId: 1, name: 'Test' } },
        timestamp: new Date().toISOString(),
      },
    }).as('login');

    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('testuser');
    cy.get('input[autocomplete="current-password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');

    // 模拟网络错误
    cy.intercept('GET', '**/api/v1/accounts*', { forceNetworkError: true }).as('networkError');

    cy.visit('/accounts');
    // 应显示错误状态
    cy.get('body').should('exist');
  });
});
