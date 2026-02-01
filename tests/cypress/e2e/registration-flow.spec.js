/**
 * 注册流程 E2E 测试
 * 命名：registration-flow.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v1.0、naming-conventions
 */

describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should_display_registration_form_when_visiting_register', () => {
    cy.get('form').should('be.visible');
    cy.get('input[name="username"], input[placeholder*="用户名"]').should('be.visible');
    cy.get('input[type="password"]').should('have.length.at.least', 1);
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should_navigate_to_login_when_clicking_login_link', () => {
    cy.contains('a', '登录').click();
    cy.url().should('include', '/login');
  });

  it('should_redirect_to_login_when_registration_succeeds', () => {
    cy.intercept('POST', '**/api/v1/auth/register', {
      statusCode: 201,
      body: {
        code: 201,
        message: 'OK',
        data: { customerId: 1, username: 'newuser' },
        timestamp: new Date().toISOString(),
      },
    }).as('register');

    cy.get('input[name="username"], input[placeholder*="用户名"]').first().type('newuser');
    cy.get('input[name="name"], input[placeholder*="姓名"]').first().type('测试用户');
    cy.get('input[type="password"]').first().type('Password123');
    // 如果有确认密码字段
    cy.get('input[type="password"]').eq(1).then(($el) => {
      if ($el.length) {
        cy.wrap($el).type('Password123');
      }
    });
    cy.get('button[type="submit"]').click();
    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  it('should_show_error_when_registration_fails', () => {
    cy.intercept('POST', '**/api/v1/auth/register', {
      statusCode: 400,
      body: { message: '用户名已存在' },
    }).as('registerFail');

    cy.get('input[name="username"], input[placeholder*="用户名"]').first().type('existinguser');
    cy.get('input[name="name"], input[placeholder*="姓名"]').first().type('测试用户');
    cy.get('input[type="password"]').first().type('Password123');
    cy.get('input[type="password"]').eq(1).then(($el) => {
      if ($el.length) {
        cy.wrap($el).type('Password123');
      }
    });
    cy.get('button[type="submit"]').click();
    cy.wait('@registerFail');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('should_validate_required_fields', () => {
    cy.get('button[type="submit"]').click();
    // HTML5 验证会阻止提交，表单应仍在注册页
    cy.url().should('include', '/register');
  });
});
