import api from "../services/api";

export async function fetchProducts(params = {}) {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    sort
  } = params;

  let query = `page=${page}&limit=${limit}`;

  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'page' && key !== 'limit' && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0) query += `&${key}=${value.join(',')}`;
      } else {
        query += `&${key}=${value}`;
      }
    }
  });

  const res = await api.get(`/products?${query}`);
  // res.data is ApiResponse structure: { status, data: { products, totalProducts, totalPages, currentPage }, message }
  return res.data.data;
}
