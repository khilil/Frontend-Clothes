import { screen, waitFor } from '../../test-utils';
import { render } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import LoginAuth from '../Login';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 1. Mock the OAuth Library
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button 
      data-testid="mock-google-login" 
      onClick={() => onSuccess({ credential: 'fake-google-token' })}
    >
      Mock Google Login
    </button>
  ),
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
}));

// 2. Mock Navigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('LoginAuth Component', () => {
  let user;
  
  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it('renders login form by default', () => {
    render(<LoginAuth />);
    expect(screen.getByText(/WELCOME/i)).toBeInTheDocument();
  });

  it('successfully handles Google Login flow', async () => {
    render(<LoginAuth />);
    const googleButton = screen.getByTestId('mock-google-login');
    await user.click(googleButton);
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  it('handles OTP flow', async () => {
    render(<LoginAuth />);
    
    // 1. Enter Email
    const emailInput = screen.getByPlaceholderText(/email@example.com/i);
    await user.type(emailInput, 'test@example.com');

    // 2. Click "Get Verification Code"
    const getOtpBtn = screen.getByText(/Get Verification Code/i);
    await user.click(getOtpBtn);

    // 3. Wait for OTP input to appear
    const otpInput = await screen.findByPlaceholderText(/• • • • • •/i);
    expect(otpInput).toBeInTheDocument();

    // 4. Verify "Authenticate" button is now visible
    // We wait for any "Generating..." or "Finalizing..." text to disappear
    await waitFor(() => {
        expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Finalizing/i)).not.toBeInTheDocument();
    }, { timeout: 4000 });

    const authBtn = await screen.findByText(/Authenticate/i);
    expect(authBtn).toBeInTheDocument();
  });
});
