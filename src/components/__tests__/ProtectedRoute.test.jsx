import { screen } from '../../test-utils.jsx';
import { render } from '../../test-utils.jsx';
import ProtectedRoute from '../ProtectedRoute.jsx';
import { describe, it, expect, vi } from 'vitest';

describe('ProtectedRoute', () => {
  it('redirects to login if user is not authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { user: null, loading: false } } }
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children if user is authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { user: { name: 'Test' }, loading: false } } }
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shows loader while auth is loading', () => {
    render(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { user: null, loading: true } } }
    );
    expect(screen.queryByText(/Protected/i)).not.toBeInTheDocument();
  });
});
