describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should show validation errors for empty fields', () => {
    cy.contains(/Get Verification Code/i).click();
    cy.contains(/Please enter your email first/i).should('be.visible');
  });

  it('should handle OTP-based login successfully', () => {
    const testEmail = 'test@example.com';
    const testOTP = '123456';

    // Mock Send OTP
    cy.intercept('POST', '**/api/v1/users/send-otp', {
      statusCode: 200,
      body: { success: true, message: 'OTP sent' }
    }).as('sendOTP');

    // Mock Verify OTP
    cy.intercept('POST', '**/api/v1/users/verify-otp', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-jwt-token',
          role: 'customer',
          user: { name: 'Test User', email: testEmail }
        }
      }
    }).as('verifyOTP');

    cy.get('input[name="email"]').type(testEmail);
    cy.contains(/Get Verification Code/i).click();
    cy.wait('@sendOTP');

    cy.get('input[name="otp"]').should('be.enabled').type(testOTP);
    cy.contains(/Authenticate/i).click();
    cy.wait('@verifyOTP');

    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains(/New Arrivals/i).should('be.visible');
  });
});
