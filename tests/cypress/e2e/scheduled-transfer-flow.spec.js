/**
 * 预约转账流程 E2E 测试（ADR-008）
 * 命名：scheduled-transfer-flow.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v2.0、naming-conventions
 */

describe('Scheduled Transfer Flow', () => {
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

  const accountsStub = () => {
    cy.intercept('GET', '**/api/v1/accounts*', {
      statusCode: 200,
      body: {
        code: 200,
        message: 'OK',
        data: {
          items: [
            { accountId: 1, accountNumber: '6200123456789012', customerId: 1, balance: 10000, currency: 'CNY', accountType: 'savings', status: 'active' },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');
  };

  const scheduledListStub = (items = []) => {
    cy.intercept('GET', '**/api/v1/transactions/scheduled*', {
      statusCode: 200,
      body: {
        code: 200,
        data: { items, total: items.length, page: 1, pageSize: 20 },
        timestamp: new Date().toISOString(),
      },
    }).as('listScheduled');
  };

  beforeEach(() => {
    loginStub();
    accountsStub();
    cy.visit('/login');
    cy.get('input[autocomplete="username"]').type('e2euser');
    cy.get('input[autocomplete="current-password"]').type('password1');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/accounts');
  });

  it('should_display_scheduled_transfer_page_when_authenticated', () => {
    scheduledListStub([]);
    cy.visit('/scheduled-transfer');
    cy.wait('@listAccounts');
    cy.contains('预约转账').should('be.visible');
    cy.contains('选择账户').should('be.visible');
  });

  it('should_show_new_form_when_click_create_button', () => {
    scheduledListStub([]);
    cy.visit('/scheduled-transfer');
    cy.wait('@listAccounts');
    cy.get('select').select('1');
    cy.wait('@listScheduled');
    cy.contains('新建预约').click();
    cy.contains('新建预约转账').should('be.visible');
    cy.get('#toAccountId').should('be.visible');
    cy.get('#amount').should('be.visible');
  });

  it('should_create_scheduled_transfer_when_submit', () => {
    scheduledListStub([]);
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    cy.intercept('POST', '**/api/v1/transactions/scheduled', {
      statusCode: 201,
      body: {
        code: 201,
        data: {
          scheduledId: 'sch-123',
          fromAccountId: 1,
          toAccountId: 2,
          amount: 500,
          scheduledTime: futureTime,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
    }).as('createScheduled');

    cy.visit('/scheduled-transfer');
    cy.wait('@listAccounts');
    cy.get('select').select('1');
    cy.wait('@listScheduled');
    cy.contains('新建预约').click();

    cy.get('#toAccountId').type('2');
    cy.get('#amount').type('500');
    // 设置预约时间（1小时后）
    const futureDate = new Date(Date.now() + 3600000);
    const dateStr = futureDate.toISOString().slice(0, 16);
    cy.get('input[type="datetime-local"]').type(dateStr);

    cy.contains('创建预约').click();
    cy.wait('@createScheduled');
  });

  it('should_display_scheduled_list_with_status', () => {
    const items = [
      {
        scheduledId: 'sch-001',
        fromAccountId: 1,
        toAccountId: 2,
        amount: 100,
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        scheduledId: 'sch-002',
        fromAccountId: 1,
        toAccountId: 3,
        amount: 200,
        scheduledTime: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        transactionId: 'TX-999',
        createdAt: new Date().toISOString(),
      },
    ];
    scheduledListStub(items);

    cy.visit('/scheduled-transfer');
    cy.wait('@listAccounts');
    cy.get('select').select('1');
    cy.wait('@listScheduled');

    cy.contains('预约列表').should('be.visible');
    cy.contains('待执行').should('be.visible');
    cy.contains('已完成').should('be.visible');
  });

  it('should_cancel_pending_scheduled_transfer', () => {
    const items = [
      {
        scheduledId: 'sch-cancel',
        fromAccountId: 1,
        toAccountId: 2,
        amount: 100,
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];
    scheduledListStub(items);

    cy.intercept('DELETE', '**/api/v1/transactions/scheduled/sch-cancel', {
      statusCode: 200,
      body: {
        code: 200,
        data: { ...items[0], status: 'cancelled' },
        timestamp: new Date().toISOString(),
      },
    }).as('cancelScheduled');

    cy.visit('/scheduled-transfer');
    cy.wait('@listAccounts');
    cy.get('select').select('1');
    cy.wait('@listScheduled');

    // 更新 stub 返回已取消的列表
    cy.intercept('GET', '**/api/v1/transactions/scheduled*', {
      statusCode: 200,
      body: {
        code: 200,
        data: { items: [{ ...items[0], status: 'cancelled' }], total: 1, page: 1, pageSize: 20 },
        timestamp: new Date().toISOString(),
      },
    });

    cy.contains('取消').click();
    cy.wait('@cancelScheduled');
  });

  it('should_show_validation_error_for_past_time', () => {
    scheduledListStub([]);
    cy.visit('/scheduled-transfer');
    cy.wait('@listAccounts');
    cy.get('select').select('1');
    cy.wait('@listScheduled');
    cy.contains('新建预约').click();

    cy.get('#toAccountId').type('2');
    cy.get('#amount').type('100');
    // 设置过去的时间
    const pastDate = new Date(Date.now() - 3600000);
    const dateStr = pastDate.toISOString().slice(0, 16);
    cy.get('input[type="datetime-local"]').type(dateStr);

    cy.contains('创建预约').click();
    cy.contains('预约时间须至少在 1 分钟后').should('be.visible');
  });
});
