import { screen, waitFor } from '../../../test-utils.jsx';
import { render } from '../../../test-utils.jsx';
import CustomStudio from '../CustomStudio.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock API
vi.mock('../../../api/products.api', () => ({
  fetchProducts: vi.fn(() => Promise.resolve({
    products: [
      {
        _id: 'p1',
        title: 'Custom Tee 1',
        slug: 'custom-tee-1',
        price: 999,
        isCustomizable: true,
        images: [{ url: '/img1.jpg' }]
      }
    ]
  }))
}));

// Mock components
vi.mock('../../../components/product/ProductCard/ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.title}</div>
}));
vi.mock('../../../components/product/Skeleton/SkeletonCards', () => ({
    default: () => <div data-testid="skeletons">Loading...</div>
}));

describe('CustomStudio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and tutorial steps', () => {
    render(<CustomStudio />);
    // Use regex that allows for spaces/newlines between words
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Custom\s*Studio/i);
    expect(screen.getByText(/Choose Base/i)).toBeInTheDocument();
  });

  it('fetches and displays customizable products', async () => {
    render(<CustomStudio />);
    
    await waitFor(() => {
        expect(screen.getAllByTestId('product-card')).toHaveLength(1);
        expect(screen.getByText('Custom Tee 1')).toBeInTheDocument();
    });
  });
});
