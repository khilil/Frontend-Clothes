import { screen, waitFor } from '../../../test-utils.jsx';
import { render } from '../../../test-utils.jsx';
import CategoryPage from '../CategoryPage.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock APIs
vi.mock('../../../api/products.api', () => ({
  fetchProducts: vi.fn(() => Promise.resolve({
    products: [
      {
        _id: 'p1',
        title: 'Product 1',
        price: 500,
        createdAt: '2023-01-01T00:00:00Z',
        variants: []
      },
      {
        _id: 'p2',
        title: 'Product 2',
        price: 1500,
        createdAt: '2023-01-02T00:00:00Z',
        variants: []
      }
    ]
  }))
}));

vi.mock('../../../api/categories.api', () => ({ fetchCategories: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/attributes.api', () => ({
  fetchSizes: vi.fn(() => Promise.resolve({ data: [] })),
  fetchColors: vi.fn(() => Promise.resolve({ data: [] }))
}));

// Mock child components
vi.mock('../../ProductDetail/Filters sidebar/FiltersSidebar', () => ({ default: () => null }));
vi.mock('../../ProductDetail/ProductSection/ProductSection', () => ({
    default: ({ products }) => (
        <div data-testid="product-section">
            {products.map(p => <div key={p._id}>{p.title}</div>)}
        </div>
    )
}));
vi.mock('../CategoryHero', () => ({ default: () => null }));
vi.mock('../../../components/common/SEO', () => ({ default: () => null }));

describe('CategoryPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products from API', async () => {
    render(<CategoryPage />, { route: '/category/all', path: '/category/:slug' });
    
    await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
});
