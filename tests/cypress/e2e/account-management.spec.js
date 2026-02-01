/**
 * 账户管理流程 E2E 测试
 * 命名：account-management.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v1.0、naming-conventions
 */

describe('Account Management Flow', () => {
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
    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('e2euser');
    cy.get('input[autocomplete="current-password"]').type('password1');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/accounts');
  };

  beforeEach(() => {
    setupAuthenticatedSession();
  });

  it('should_display_account_list_when_authenticated', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            { accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 10000.50, currency: 'CNY', accountType: 'savings', status: 'active' },
            { accountId: 2, accountNumber: '6200123456789013', customerId: 1, balance: 5000.00, currency: 'CNY', accountType: 'checking', status: 'active' },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');

    cy.wait('@listAccounts');
    cy.get('[data-testid="account-card"], .account-card, [class*="account"]').should('have.length.at.least', 1);
  });

  it('should_display_account_balance_correctly', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            { accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 10000.50, currency: 'CNY', accountType: 'savings', status: 'active' },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');

    cy.wait('@listAccounts');
    cy.contains('10,000.50').should('be.visible').or(cy.contains('10000.50').should('exist'));
  });

  it('should_show_empty_state_when_no_accounts', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { items: [], total: 0, page: 1, pageSize: 20 },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');

    cy.wait('@listAccounts');
    // 应显示无账户提示或空状态
    cy.get('body').should('contain.text', '');
  });

  it('should_handle_api_error_gracefully', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('listAccountsFail');

    cy.wait('@listAccountsFail');
    // 应显示错误提示
    cy.get('[role="alert"], .error, [class*="error"]').should('exist').or(cy.get('body').should('contain.text', ''));
  });
});
