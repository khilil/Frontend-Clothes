import { describe, it, expect, vi } from 'vitest';
import * as cartService from '../cartService';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('cartService', () => {
  it('fetches cart successfully', async () => {
    const mockCart = { items: [], total: 0 };
    server.use(
      http.get('*/cart', () => HttpResponse.json(mockCart))
    );

    const data = await cartService.getCart();
    expect(data).toEqual(mockCart);
  });

  it('adds item to cart', async () => {
    server.use(
      http.post('*/cart/add', () => HttpResponse.json({ success: true }))
    );

    const result = await cartService.addToCart('prod1', 'var1', 1);
    expect(result.success).toBe(true);
  });

  it('handles errors gracefully', async () => {
    server.use(
      http.get('*/cart', () => new HttpResponse(null, { status: 500 }))
    );

    await expect(cartService.getCart()).rejects.toThrow();
  });
});
