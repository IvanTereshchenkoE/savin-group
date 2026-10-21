import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('API Route Handler: POST /api/calculator/quote', () => {
  it('returns calculated quote for valid input', async () => {
    const request = new Request('http://localhost:3000/api/calculator/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: 'spb',
        items: [
          { serviceCode: 'partition_single', quantity: '15' },
          { serviceCode: 'ceiling_single', quantity: '20' },
          { serviceCode: 'putty_paint', quantity: '45' },
          { serviceCode: 'paint_two_coats', quantity: '45' },
        ],
        ceilingHeightBand: 'UP_TO_3',
        doorOpenings: 0,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      success: boolean;
      quote: { total: { minKopeks: number; maxKopeks: number } };
    };
    expect(json.success).toBe(true);
    expect(json.quote.total).toEqual({ minKopeks: 6039000, maxKopeks: 8701000 });
  });

  it('returns 400 for invalid input format', async () => {
    const request = new Request('http://localhost:3000/api/calculator/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: 'invalid_city',
        items: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = (await response.json()) as { code: string };
    expect(json.code).toBe('INVALID_INPUT');
  });

  it('returns 422 for domain calculator error (e.g. door openings without partitions)', async () => {
    const request = new Request('http://localhost:3000/api/calculator/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: 'spb',
        items: [{ serviceCode: 'ceiling_single', quantity: '10' }],
        ceilingHeightBand: 'UP_TO_3',
        doorOpenings: 2,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(422);

    const json = (await response.json()) as { code: string };
    expect(json.code).toBe('DOOR_OPENINGS_REQUIRE_PARTITIONS');
  });
});
