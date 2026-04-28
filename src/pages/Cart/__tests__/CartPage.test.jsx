import { screen, waitFor } from '../../../test-utils.jsx';
import { render } from '../../../test-utils.jsx';
import CartPage from '../CartPage.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the context hooks - must go up 3 levels from __tests__ to src/
vi.mock('../../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    cart: [],
    updateQty: vi.fn(),
    removeItem: vi.fn(),
    isLoading: false,
    appliedCoupon: null,
    applyCoupon: vi.fn(),
    removeCoupon: vi.fn()
  }))
}));

// Mock useOffers hook
vi.mock('../../../context/OfferContext', () => ({
  useOffers: vi.fn(() => ({
    getCartOffers: () => [],
    getProductOffer: () => null,
    activeOffers: []
  }))
}));

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty cart message when no items', async () => {
    render(<CartPage />);
    expect(screen.getByText(/Your Bag is Empty/i)).toBeInTheDocument();
  });

  it('renders cart items when available', async () => {
    const mockItems = [{
        cartItemId: 'item1',
        title: 'Cool Shirt',
        price: 1000,
        image: '/img.jpg',
        qty: 1,
        size: 'M',
        color: 'Red'
    }];

    // Import from correct path
    const { useCart } = await import('../../../context/CartContext');
    vi.mocked(useCart).mockReturnValue({
        cart: mockItems,
        updateQty: vi.fn(),
        removeItem: vi.fn(),
        isLoading: false,
        appliedCoupon: null,
        applyCoupon: vi.fn(),
        removeCoupon: vi.fn()
    });

    render(<CartPage />);
    
    expect(screen.getByText(/Cool Shirt/i)).toBeInTheDocument();
    
    // Use getAllByText as it appears in item list and summary
    const priceElements = screen.getAllByText(/1,000/i);
    expect(priceElements.length).toBeGreaterThan(0);
    expect(priceElements[0]).toBeInTheDocument();
  });
});
