import { describe, it, expect } from 'vitest';
import * as orderService from '../orderService';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('orderService', () => {
  it('performs cart checkout', async () => {
    server.use(
      http.post('*/orders/checkout', () => HttpResponse.json({ success: true, data: { _id: 'order1' } }))
    );
    const result = await orderService.cartCheckout({ items: [] });
    expect(result.success).toBe(true);
    expect(result.data._id).toBe('order1');
  });

  it('fetches user orders', async () => {
    server.use(
      http.get('*/orders/my-orders', () => HttpResponse.json({ success: true, data: [] }))
    );
    const result = await orderService.getMyOrders();
    expect(result.success).toBe(true);
  });
});
