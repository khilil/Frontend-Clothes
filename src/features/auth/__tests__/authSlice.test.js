import { describe, it, expect } from 'vitest';
import authReducer from '../authSlice';
import { loginUser } from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    role: null,
    loading: true,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle loginUser.pending', () => {
    const state = authReducer(initialState, loginUser.pending());
    expect(state.loading).toBe(true);
  });

  it('should handle loginUser.fulfilled', () => {
    const mockUser = { name: 'Test' };
    const state = authReducer(initialState, loginUser.fulfilled({ data: { user: mockUser, role: 'customer' } }));
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.role).toBe('customer');
  });

  it('should handle loginUser.rejected', () => {
    const state = authReducer(initialState, loginUser.rejected(null, '', null, 'Error message'));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error message');
  });
});
