import { describe, it, expect } from 'vitest';
import * as productService from '../productService';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('productService', () => {
  it('fetches products', async () => {
    const mockProducts = [{ id: '1', name: 'Shirt' }];
    server.use(
      http.get('*/products', () => HttpResponse.json({ data: mockProducts }))
    );

    const data = await productService.getProducts();
    expect(data).toEqual(mockProducts);
  });

  it('fetches single product by slug', async () => {
    const mockProduct = { id: '1', name: 'Shirt', slug: 'cool-shirt' };
    server.use(
      http.get('*/products/cool-shirt', () => HttpResponse.json({ data: mockProduct }))
    );

    const data = await productService.getProductBySlug('cool-shirt');
    expect(data).toEqual(mockProduct);
  });
});
