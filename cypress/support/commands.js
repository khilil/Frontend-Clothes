Cypress.Commands.add('login', (role = 'customer') => {
  cy.clearCookies();
  cy.clearLocalStorage();

  const mockUser = {
    success: true,
    data: {
      _id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: role
    }
  };

  cy.intercept('GET', '**/users/current-user', mockUser).as('getCurrentUser');
  cy.intercept('GET', '**/orders/my-orders', { success: true, data: [] }).as('getMyOrders');

  cy.window().then((win) => {
    win.localStorage.setItem('refreshToken', 'mock-token');
    win.localStorage.setItem('role', role);
  });
});

Cypress.Commands.add('addToCart', () => {
  // 1. Wait for size section
  cy.contains(/Size/i, { timeout: 15000 }).should('be.visible');
  
  // 2. Select size
  cy.get('button').filter(':visible').then(($buttons) => {
    const sizeButtons = $buttons.filter((i, el) => {
      const text = el.innerText.trim();
      return /^(S|M|L|XL|XXL|2XL|3XL|[0-9]+)$/.test(text);
    });
    
    if (sizeButtons.length > 0) {
      const btn = sizeButtons.first();
      cy.wrap(btn).click({ force: true });
      // Small wait for state update
      cy.wait(1000);
    } else {
      cy.contains(/Select Size/i).closest('div').parent().find('button').not(':disabled').first().click({ force: true });
      cy.wait(1000);
    }
  });

  // 3. Click Add to Bag
  cy.get('body').then(($body) => {
    if ($body.text().includes('Start Designing')) {
      cy.contains('button', /Start Designing/i).click({ force: true });
      cy.get('canvas', { timeout: 30000 }).should('be.visible');
      cy.contains('button', /Preview/i).click({ force: true });
      cy.contains('button', /Add to Bag/i, { timeout: 20000 }).click({ force: true });
    } else {
      cy.contains('button', /Add To Bag/i).click({ force: true });
    }
  });

  // 4. Verify cart count increases or is not 0
  cy.get('#cart-count', { timeout: 20000 }).should('not.contain', '0');
});
