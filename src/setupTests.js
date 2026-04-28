import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Set global timeout to handle heavy JSDOM renders
vi.setConfig({ testTimeout: 10000 });

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// More thorough framer-motion mock
vi.mock('framer-motion', async () => {
  const React = await import('react');
  
  const filterProps = (props) => {
    const validProps = { ...props };
    const motionProps = [
      'animate', 'initial', 'exit', 'transition', 'variants', 
      'viewport', 'whileInView', 'whileHover', 'whileTap', 
      'layout', 'layoutId', 'onAnimationStart', 'onAnimationComplete',
      'drag', 'dragConstraints', 'dragElastic', 'dragTransition'
    ];
    motionProps.forEach(prop => delete validProps[prop]);
    return validProps;
  };

  const motion = new Proxy({}, {
    get: (target, tag) => {
      return React.forwardRef(({ children, ...props }, ref) => {
        return React.createElement(tag, { ...filterProps(props), ref }, children);
      });
    }
  });

  return {
    motion,
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useScroll: () => ({ scrollY: { get: () => 0, onChange: vi.fn() }, scrollYProgress: { get: () => 0, onChange: vi.fn() } }),
    useTransform: () => ({ get: vi.fn() }),
    useSpring: () => ({ get: vi.fn() }),
    useMotionValue: () => ({ get: vi.fn(), set: vi.fn() }),
    useMotionValueEvent: (value, event, callback) => {
        // Just call the callback once to simulate initial state if needed
    },
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock ScrollTo
window.scrollTo = vi.fn();

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
      getItem: function(key) {
        return store[key] || null;
      },
      setItem: function(key, value) {
        store[key] = value.toString();
      },
      removeItem: function(key) {
        delete store[key];
      },
      clear: function() {
        store = {};
      }
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
