import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Auth Login
  http.post('*/users/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'fake-token',
        role: 'customer',
        user: { name: 'Test User', email: 'test@example.com' }
      }
    });
  }),

  // Mock Google Login
  http.post('*/users/google-login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'fake-google-token',
        role: 'customer',
        user: { name: 'Google User', email: 'google@example.com' }
      }
    });
  }),

  // Mock OTP Send
  http.post('*/users/send-otp', () => {
    return HttpResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });
  }),

  // Mock OTP Verify
  http.post('*/users/verify-otp', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'fake-otp-token',
        role: 'customer',
        user: { name: 'Test User', email: 'test@example.com' }
      }
    });
  }),
];
