describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.login('customer');
    cy.visit('/category/all');
    cy.get('[data-testid="product-card"]', { timeout: 15000 }).first().click();
    cy.addToCart();
    // Wait for the cart state to be persisted
    cy.wait(4000); 
    cy.visit('/checkout', {
      onBeforeLoad(win) {
        win.localStorage.setItem('refreshToken', 'mock-token');
        win.localStorage.setItem('role', 'customer');
      }
    });
  });

  it('should navigate through checkout steps', () => {
    // If it redirects to login or home, this will fail
    cy.url().should('include', '/checkout');
    cy.contains(/Shipping|Delivery|Address/i, { timeout: 20000 }).should('be.visible');
    
    cy.get('body').then(($body) => {
      const inputs = $body.find('input[name="firstName"]');
      if (inputs.length > 0) {
        cy.get('input[name="firstName"]').type('John', {force: true});
        cy.get('input[name="lastName"]').type('Doe', {force: true});
        cy.get('input[name="phone"]').type('9876543210', {force: true});
        cy.get('input[name="addressLine"]').type('123 Test Street', {force: true});
        cy.get('input[name="city"]').type('Mumbai', {force: true});
        cy.get('input[name="state"]').type('Maharashtra', {force: true});
        cy.get('input[name="pincode"]').type('400001', {force: true});
      } else {
        // Look for existing address cards
        cy.get('.luxury-card, .address-card', { timeout: 10000 }).first().click({force: true});
      }
    });

    cy.contains('button', /Continue|Payment/i).click({force: true});

    cy.contains(/Payment|Billing/i, { timeout: 15000 }).should('be.visible');
    cy.contains(/Cash on Delivery|COD/i, { timeout: 10000 }).click({force: true});
    
    cy.intercept('POST', '**/api/v1/orders/checkout', {
      statusCode: 201,
      body: { success: true, data: { _id: 'mock-order-id' } }
    }).as('placeOrder');

    cy.contains('button', /Complete|Place Order|Purchase/i).click({force: true});
    
    cy.wait('@placeOrder', { timeout: 15000 });
    cy.contains(/Confirmed|Success|Thank You/i, { timeout: 25000 }).should('be.visible');
  });
});
