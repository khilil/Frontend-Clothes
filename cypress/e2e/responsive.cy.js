describe('Responsive Design Flow', () => {
  const viewports = ['iphone-x', 'macbook-15'];

  viewports.forEach((viewport) => {
    it(`should render correctly on ${viewport}`, () => {
      cy.viewport(viewport);
      cy.visit('/');
      
      if (viewport === 'iphone-x') {
        cy.get('button.menu-toggle', { timeout: 10000 }).should('be.visible');
      } else {
        cy.contains(/Clothing|Shop|New/i, { timeout: 10000 }).should('be.visible');
      }
    });
  });

  it('should open mobile menu and navigate', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('button.menu-toggle').click();
    // The mobile menu is a div that slides in
    cy.get('body').should('contain', 'Account');
    cy.get('body').should('contain', 'Clothing');
  });
});
