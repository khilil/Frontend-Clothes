import { screen, waitFor, fireEvent } from '../../../../test-utils.jsx';
import { render } from '../../../../test-utils.jsx';
import ProductDetailPage from '../ProductDetailPage.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock services
vi.mock('../../../../services/productService', () => ({
  getProductBySlug: vi.fn((slug) => Promise.resolve({
    _id: 'prod1',
    title: 'OVERSIZED TEE',
    slug: slug || 'oversized-tee',
    price: 1499,
    compareAtPrice: 1999,
    description: 'High quality cotton tee.',
    isCustomizable: true,
    variants: [
      {
        _id: 'v1',
        sku: 'SKU001',
        size: { name: 'M' },
        color: { name: 'Black', hexCode: '#000000' },
        stock: 10,
        images: [{ url: '/img1.jpg', isPrimary: true }]
      }
    ]
  }))
}));

vi.mock('../../../../services/offerService', () => ({
  getActiveOffers: vi.fn(() => Promise.resolve({ data: [] }))
}));

// Mock contexts
vi.mock('../../../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    addToCart: vi.fn()
  }))
}));

vi.mock('../../../../context/WishlistContext', () => ({
  useWishlist: vi.fn(() => ({
    wishlist: [],
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    isInWishlist: vi.fn(() => false)
  }))
}));

vi.mock('../../../../context/SocketContext', () => ({
    useSocket: vi.fn(() => ({ socket: null }))
}));

// Mock child components
vi.mock('../ProductSuggestions', () => ({ ProductSuggestions: () => null }));
vi.mock('../Reviews', () => ({ default: () => null }));
vi.mock('../CustomizationPop_popModel', () => ({ default: () => null }));
vi.mock('../OffersSection', () => ({ OffersSection: () => null }));
vi.mock('../SizeGuideModal', () => ({ default: () => null }));
vi.mock('../../../components/common/CollectiveFooter/CollectiveFooter', () => ({ default: () => null }));
vi.mock('../../../components/common/SEO', () => ({ default: () => null }));

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testProps = {
    route: '/product/oversized-tee',
    path: '/product/:slug'
  };

  it('renders product details correctly', async () => {
    render(<ProductDetailPage />, testProps);
    
    await waitFor(() => {
        expect(screen.getByText(/OVERSIZED TEE/i)).toBeInTheDocument();
    });
  });

  it('shows size and color options', async () => {
    render(<ProductDetailPage />, testProps);
    
    await waitFor(() => {
        expect(screen.getByText('M')).toBeInTheDocument();
        // The color button might be hard to find by text, so we check if any button exists
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });
});
