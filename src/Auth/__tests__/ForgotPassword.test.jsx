import { screen, waitFor, fireEvent } from '../../test-utils.jsx';
import { render } from '../../test-utils.jsx';
import ForgotPassword from '../ForgotPassword.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ForgotPassword />);
    expect(screen.getByText(/Recover/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your credential/i)).toBeInTheDocument();
  });

  it('handles successful reset request', async () => {
    server.use(
      http.post('*/users/forgot-password', () => HttpResponse.json({ success: true, message: 'A reset link has been sent to your email.' }))
    );

    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText(/Enter your credential/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(screen.getByText(/A reset link has been sent to your email/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
