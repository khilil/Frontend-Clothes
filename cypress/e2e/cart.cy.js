describe('Cart Flow', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      return new Promise((resolve) => {
        const req = win.indexedDB.deleteDatabase('GenzClothsDB');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    });
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit('/category/all');
    cy.get('[data-testid="product-card"]', { timeout: 15000 }).first().click();
    cy.addToCart();
    
    cy.wait(3000); 
    cy.visit('/cart');
    cy.contains(/Summary|Cart|Your Bag/i, { timeout: 15000 }).should('be.visible');
  });

  it('should display items in cart', () => {
    cy.contains('1', { timeout: 10000 }).should('be.visible');
  });

  it('should update quantity', () => {
    // 1. Target the row containing the product
    cy.get('span').contains('add').closest('div').within(() => {
      // 2. Initial quantity should be 1
      cy.get('span').should('contain', '1');
      
      // 3. Click add
      cy.get('span').contains('add').parent().click({force: true});
      cy.wait(1000);
      
      // 4. Verify quantity becomes 2
      cy.get('span').should('contain', '2');
      
      // 5. Click remove
      cy.get('span').contains('remove').parent().click({force: true});
      cy.wait(1000);
      
      // 6. Verify quantity becomes 1
      cy.get('span').should('contain', '1');
    });
  });

  it('should remove item from cart', () => {
    cy.get('span').contains('delete').closest('button').click({force: true});
    cy.get('h1, h2', { timeout: 15000 }).contains(/Bag is Empty|Empty/i).should('be.visible');
  });
});
