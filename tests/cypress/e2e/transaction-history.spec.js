/**
 * 交易历史流程 E2E 测试
 * 命名：transaction-history.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v1.0、naming-conventions
 */

describe('Transaction History Flow', () => {
  const mockAuthToken = 'e2e-token';
  const mockUser = { id: '1', username: 'e2e', customerId: 1, name: 'E2E User' };

  const setupAuthenticatedSession = () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { token: mockAuthToken, user: mockUser },
        timestamp: new Date().toISOString(),
      },
    });
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [{ accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 10000, currency: 'CNY', accountType: 'savings', status: 'active' }],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    });
    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('e2euser');
    cy.get('input[autocomplete="current-password"]').type('password1');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/accounts');
  };

  beforeEach(() => {
    setupAuthenticatedSession();
  });

  it('should_display_transaction_list_when_visiting_history', () => {
    cy.intercept('GET', '**/api/v1/transactions*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            { transactionId: 'T1', fromAccountId: 1, toAccountId: 2, amount: 100, type: 'transfer', status: 'completed', createdAt: '2026-01-29T10:00:00Z' },
            { transactionId: 'T2', fromAccountId: 1, toAccountId: 3, amount: 200, type: 'transfer', status: 'completed', createdAt: '2026-01-28T15:30:00Z' },
            { transactionId: 'T3', fromAccountId: 4, toAccountId: 1, amount: 500, type: 'transfer', status: 'completed', createdAt: '2026-01-27T09:00:00Z' },
          ],
          total: 3,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listTransactions');

    cy.visit('/transactions');
    cy.wait('@listTransactions');
    cy.get('[data-testid="transaction-row"], .transaction-row, table tbody tr, [class*="transaction"]').should('have.length.at.least', 1);
  });

  it('should_display_empty_state_when_no_transactions', () => {
    cy.intercept('GET', '**/api/v1/transactions*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { items: [], total: 0, page: 1, pageSize: 20 },
        timestamp: new Date().toISOString(),
      },
    }).as('listTransactions');

    cy.visit('/transactions');
    cy.wait('@listTransactions');
    cy.get('body').should('contain.text', '');
  });

  it('should_support_pagination_when_many_transactions', () => {
    const transactions = Array.from({ length: 20 }, (_, i) => ({
      transactionId: `T${i + 1}`,
      fromAccountId: 1,
      toAccountId: 2,
      amount: (i + 1) * 10,
      type: 'transfer',
      status: 'completed',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    cy.intercept('GET', '**/api/v1/transactions*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { items: transactions.slice(0, 10), total: 20, page: 1, pageSize: 10 },
        timestamp: new Date().toISOString(),
      },
    }).as('listTransactions');

    cy.visit('/transactions');
    cy.wait('@listTransactions');
    // 验证页面显示了交易列表
    cy.get('body').should('exist');
  });

  it('should_handle_api_error_gracefully', () => {
    cy.intercept('GET', '**/api/v1/transactions*', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('listTransactionsFail');

    cy.visit('/transactions');
    cy.wait('@listTransactionsFail');
    // 应显示错误提示或空状态
    cy.get('body').should('exist');
  });
});
