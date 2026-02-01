/**
 * 登录流程 E2E 测试（基于 OpenAPI /auth/login 与前端 LoginPage）
 * 命名：login-flow.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v1.0、naming-conventions
 */

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should_display_login_form_when_visiting_login', () => {
    cy.get('form').should('be.visible');
    cy.get('input[autocomplete="username"]').should('be.visible');
    cy.get('input[autocomplete="current-password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should_navigate_to_register_when_clicking_register_link', () => {
    cy.contains('a', '注册').click();
    cy.url().should('include', '/register');
  });

  it('should_redirect_to_accounts_when_login_succeeds', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: { token: 'e2e-token', user: { id: '1', username: 'e2e', customerId: 1, name: 'E2E' } },
        timestamp: new Date().toISOString(),
      },
    }).as('login');
    cy.get('input[autocomplete="username"]').type('e2euser');
    cy.get('input[autocomplete="current-password"]').type('password1');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');
    cy.url().should('include', '/accounts');
  });

  it('should_show_error_when_login_fails', () => {
    cy.intercept('POST', '**/api/v1/auth/login', { statusCode: 401, body: { message: '用户名或密码错误' } }).as('loginFail');
    cy.get('input[autocomplete="username"]').type('bad');
    cy.get('input[autocomplete="current-password"]').type('bad');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginFail');
    cy.get('[role="alert"]').should('be.visible');
  });
});
