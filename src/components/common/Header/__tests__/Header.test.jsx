import { screen, waitFor, fireEvent } from '../../../../test-utils.jsx';
import { render } from '../../../../test-utils.jsx';
import Header from '../Header.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock services
vi.mock('../../../../services/categoryService', () => ({
  getAllCategories: vi.fn(() => Promise.resolve({ data: [] }))
}));

vi.mock('../../../../api/products.api', () => ({
  fetchProducts: vi.fn(() => Promise.resolve({ products: [] }))
}));

// Mock contexts
vi.mock('../../../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    cart: [],
    setCartOpen: vi.fn()
  }))
}));

vi.mock('../../../../context/WishlistContext', () => ({
  useWishlist: vi.fn(() => ({
    wishlist: []
  }))
}));

// Mock MiniCart to simplify
vi.mock('../../../../pages/Cart/MiniCart', () => ({
  default: () => <div data-testid="mini-cart">MiniCart</div>
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo and basic navigation', () => {
    render(<Header />);
    expect(screen.getByAltText(/FENRIR/i)).toBeInTheDocument();
    expect(screen.getByText(/New Arrivals/i)).toBeInTheDocument();
  });

  it('shows cart count when items are present', async () => {
    const { useCart } = await import('../../../../context/CartContext');
    vi.mocked(useCart).mockReturnValue({
      cart: [{ id: 1 }, { id: 2 }],
      setCartOpen: vi.fn()
    });

    render(<Header />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows user initials when logged in', () => {
    render(<Header />, {
      preloadedState: {
        auth: { user: { name: 'John Doe' } }
      }
    });

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('toggles search expansion', async () => {
    render(<Header />);
    // Find search button (the one with search icon)
    const searchBtns = screen.getAllByRole('button');
    const searchBtn = searchBtns.find(btn => btn.innerHTML.includes('search'));
    
    if (searchBtn) {
        fireEvent.click(searchBtn);
        const searchInput = screen.getByPlaceholderText(/SEARCH\.\.\./i);
        expect(searchInput).toBeInTheDocument();
    }
  });
});
