import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import your reducers
import authReducer from './features/auth/authSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';

/**
 * Custom render function that wraps the component with all necessary providers.
 * Allows passing an initial state for the Redux store and routing info.
 */
function renderWithProviders(
  ui,
  {
    preloadedState = {},
    route = '/',
    path = '/',
    // Create a fresh store for every test
    store = configureStore({
      reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <HelmetProvider>
          <GoogleOAuthProvider clientId="fake-client-id">
            <MemoryRouter initialEntries={[route]}>
              <Routes>
                <Route path={path} element={children} />
              </Routes>
            </MemoryRouter>
          </GoogleOAuthProvider>
        </HelmetProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Re-export everything from RTL
export * from '@testing-library/react';

// Override the render method
export { renderWithProviders as render };
