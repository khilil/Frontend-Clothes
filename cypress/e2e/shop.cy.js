describe('Shop & Product Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to category page and filter products', () => {
    // Open Mega Menu - use force if animation is tricky
    cy.contains(/Clothing|Shop|New/i).trigger('mouseover', { force: true });
    cy.contains(/New This Week|All/i).click({force: true});
    
    cy.url().should('match', /\/category\//);
    cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.at.least', 1);
  });

  it('should view product details and select variants', () => {
    cy.visit('/category/all');
    cy.get('[data-testid="product-card"]').first().click();
    
    cy.url().should('match', /\/(product|customize)\//);
    cy.addToCart();
  });
});
