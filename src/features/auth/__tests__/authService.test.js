import { describe, it, expect } from 'vitest';
import { loginAPI, sendOTPAPI } from '../authService';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('authService', () => {
  it('calls login API', async () => {
    server.use(
      http.post('*/users/login', () => HttpResponse.json({ success: true, data: {} }))
    );
    const result = await loginAPI({ email: 't@t.com', password: 'p' });
    expect(result.success).toBe(true);
  });

  it('calls send OTP API', async () => {
    server.use(
      http.post('*/users/send-otp', () => HttpResponse.json({ success: true }))
    );
    const result = await sendOTPAPI('t@t.com');
    expect(result.success).toBe(true);
  });
});
