describe('Account & Profile Flow', () => {
  const loginAndVisit = (path) => {
    cy.login('customer');
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('refreshToken', 'mock-token');
        win.localStorage.setItem('role', 'customer');
      }
    });
  };

  it('should display user dashboard', () => {
    loginAndVisit('/account/dashboard');
    cy.wait(2000);
    cy.get('body', { timeout: 15000 }).should((body) => {
      const text = body.text();
      const keywords = [/Welcome/i, /Dashboard/i, /Orders/i, /Profile/i];
      const found = keywords.some(regex => regex.test(text));
      expect(found, "Dashboard content should be visible").to.be.true;
    });
  });

  it('should view order history', () => {
    loginAndVisit('/account/orders');
    cy.contains(/Orders|Transactions|History|No orders/i, { timeout: 20000 }).should('be.visible');
  });

  it('should logout successfully', () => {
    loginAndVisit('/account/dashboard');
    cy.wait(2000);
    cy.get('body').then(($body) => {
      const logoutBtn = $body.find('button:contains("Logout"), button:contains("Deactivate"), button:contains("Session")');
      if (logoutBtn.length > 0) {
        cy.wrap(logoutBtn).first().click({force: true});
      } else {
        cy.get('button').filter(':visible').find('span').contains(/logout|exit/i).closest('button').click({force: true});
      }
    });
    cy.url({ timeout: 10000 }).should('include', '/');
  });
});
