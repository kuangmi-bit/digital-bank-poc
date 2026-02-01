/**
 * 转账流程 E2E 测试（基于 OpenAPI /transactions/transfer 与前端 Transfer 页）
 * 命名：transfer-flow.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v1.0、naming-conventions
 */

describe('Transfer Flow', () => {
  const loginStub = () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { token: 'e2e-token', user: { id: '1', username: 'e2e', customerId: 1, name: 'E2E' } },
        timestamp: new Date().toISOString(),
      },
    });
  };

  beforeEach(() => {
    loginStub();
    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('e2euser');
    cy.get('input[autocomplete="current-password"]').type('password1');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/accounts');
  });

  it('should_display_transfer_form_when_authenticated', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [{ accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 1000, currency: 'CNY', accountType: 'savings', status: 'active' }],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');
    cy.visit('/transfer');
    cy.wait('@listAccounts');
    cy.get('form').should('be.visible');
    cy.get('#fromAccountId').should('be.visible');
    cy.get('#toAccountId').should('be.visible');
    cy.get('#amount').should('be.visible');
  });

  it('should_submit_transfer_and_clear_form_when_success', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [{ accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 1000, currency: 'CNY', accountType: 'savings', status: 'active' }],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');
    cy.intercept('POST', '**/api/v1/transactions/transfer', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { transactionId: 'T1', fromAccountId: 1, toAccountId: 2, amount: 10, status: 'completed' },
        timestamp: new Date().toISOString(),
      },
    }).as('transfer');
    cy.visit('/transfer');
    cy.wait('@listAccounts');
    cy.get('#fromAccountId').select('1');
    cy.get('#toAccountId').type('2');
    cy.get('#amount').type('10');
    cy.window().then((w) => cy.stub(w, 'confirm').returns(false));
    cy.get('form').find('button[type="submit"]').click();
    cy.wait('@transfer');
    cy.get('#amount').should('have.value', '');
  });

  it('should_show_error_when_transfer_fails', () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: { code: 200, message: 'OK', data: { items: [{ accountId: 1, accountNumber: '6200', customerId: 1, balance: 100, currency: 'CNY', accountType: 'savings', status: 'active' }], total: 1, page: 1, pageSize: 20 }, timestamp: new Date().toISOString() },
    });
    cy.intercept('POST', '**/api/v1/transactions/transfer', { statusCode: 400, body: { message: '余额不足' } }).as('transferFail');
    cy.visit('/transfer');
    cy.get('#fromAccountId').select('1');
    cy.get('#toAccountId').type('2');
    cy.get('#amount').type('99999');
    cy.get('form').find('button[type="submit"]').click();
    cy.wait('@transferFail');
    cy.get('[role="alert"]').should('be.visible');
  });
});
