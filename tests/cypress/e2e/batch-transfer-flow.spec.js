/**
 * 批量转账流程 E2E 测试（ADR-008）
 * 命名：batch-transfer-flow.spec.js；it('should_xxx_when_yyy')
 * 遵循 technical-standards-v2.0、naming-conventions
 */

describe('Batch Transfer Flow', () => {
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
            { accountId: 2, accountNumber: '6200987654321098', customerId: 1, balance: 5000, currency: 'CNY', accountType: 'checking', status: 'active' },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
        },
        timestamp: new Date().toISOString(),
      },
    }).as('listAccounts');
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

  it('should_display_batch_transfer_form_when_authenticated', () => {
    cy.visit('/batch-transfer');
    cy.wait('@listAccounts');
    cy.get('form').should('be.visible');
    cy.contains('批量转账').should('be.visible');
    cy.contains('添加一笔').should('be.visible');
  });

  it('should_add_and_remove_transfer_rows', () => {
    cy.visit('/batch-transfer');
    cy.wait('@listAccounts');
    // 初始 1 行
    cy.get('[class*="bg-neutral-surface-2"]').should('have.length', 1);
    // 添加一笔
    cy.contains('添加一笔').click();
    cy.get('[class*="bg-neutral-surface-2"]').should('have.length', 2);
    // 再添加一笔
    cy.contains('添加一笔').click();
    cy.get('[class*="bg-neutral-surface-2"]').should('have.length', 3);
    // 删除一笔
    cy.contains('删除').first().click();
    cy.get('[class*="bg-neutral-surface-2"]').should('have.length', 2);
  });

  it('should_submit_batch_transfer_and_show_results_when_success', () => {
    cy.intercept('POST', '**/api/v1/transactions/batch-transfer', {
      statusCode: 200,
      body: {
        code: 200,
        data: {
          batchId: 'batch-123',
          totalCount: 2,
          successCount: 2,
          failedCount: 0,
          results: [
            { index: 0, transactionId: 'TX001', status: 'completed' },
            { index: 1, transactionId: 'TX002', status: 'completed' },
          ],
        },
        timestamp: new Date().toISOString(),
      },
    }).as('batchTransfer');

    cy.visit('/batch-transfer');
    cy.wait('@listAccounts');

    // 填写第一笔
    cy.get('select').first().select('1');
    cy.get('input[placeholder="账户ID"]').first().type('3');
    cy.get('input[placeholder="0.00"]').first().type('100');

    // 添加并填写第二笔
    cy.contains('添加一笔').click();
    cy.get('select').eq(1).select('2');
    cy.get('input[placeholder="账户ID"]').eq(1).type('4');
    cy.get('input[placeholder="0.00"]').eq(1).type('200');

    // 提交
    cy.contains('提交 2 笔转账').click();
    cy.wait('@batchTransfer');

    // 验证结果显示
    cy.contains('执行结果').should('be.visible');
    cy.contains('✓ 成功').should('have.length', 2);
  });

  it('should_show_partial_failure_results', () => {
    cy.intercept('POST', '**/api/v1/transactions/batch-transfer', {
      statusCode: 200,
      body: {
        code: 200,
        data: {
          batchId: 'batch-456',
          totalCount: 2,
          successCount: 1,
          failedCount: 1,
          results: [
            { index: 0, transactionId: 'TX003', status: 'completed' },
            { index: 1, transactionId: null, status: 'failed', errorCode: 'CBB002', message: '余额不足' },
          ],
        },
        timestamp: new Date().toISOString(),
      },
    }).as('batchTransferPartial');

    cy.visit('/batch-transfer');
    cy.wait('@listAccounts');

    cy.get('select').first().select('1');
    cy.get('input[placeholder="账户ID"]').first().type('3');
    cy.get('input[placeholder="0.00"]').first().type('100');
    cy.contains('添加一笔').click();
    cy.get('select').eq(1).select('1');
    cy.get('input[placeholder="账户ID"]').eq(1).type('4');
    cy.get('input[placeholder="0.00"]').eq(1).type('99999');

    cy.contains('提交 2 笔转账').click();
    cy.wait('@batchTransferPartial');

    cy.contains('✓ 成功').should('have.length', 1);
    cy.contains('✗ 失败').should('have.length', 1);
    cy.contains('余额不足').should('be.visible');
  });

  it('should_show_validation_error_when_missing_fields', () => {
    cy.visit('/batch-transfer');
    cy.wait('@listAccounts');
    // 不填写任何内容直接提交
    cy.contains('提交 1 笔转账').click();
    cy.get('[role="alert"]').should('be.visible');
  });
});
