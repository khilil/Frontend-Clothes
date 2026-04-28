describe('Custom Studio Flow', () => {
  it('should navigate to studio and customize a t-shirt', () => {
    cy.visit('/custom-studio');
    
    // Select a base product
    cy.get('[data-testid="product-card"]', { timeout: 15000 }).first().click();
    cy.url().should('include', '/customize/');

    // Configure and add to bag
    cy.addToCart();
    
    // Verify redirection to cart
    cy.url({ timeout: 10000 }).should('include', '/cart');
  });
});
