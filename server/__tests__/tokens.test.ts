import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import tokenRoutes from '../routes/tokens.js';

// Mock db — must be declared before imports are processed.
vi.mock('../db.js', () => ({
  db: {
    competitions: { findById: vi.fn() },
    restaurants:  { findById: vi.fn() },
    tokens: {
      redeem:   vi.fn(),
      findById: vi.fn(),
      create:   vi.fn(),
    },
  },
}));

import { db } from '../db.js';

const app = express();
app.use(express.json());
app.use('/api/tokens', tokenRoutes);

const request = supertest(app);

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// POST /api/tokens/redeem
// ---------------------------------------------------------------------------
describe('POST /api/tokens/redeem', () => {
  it('returns 400 when token is missing', async () => {
    const res = await request.post('/api/tokens/redeem').send({});
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('returns 404 when token does not exist', async () => {
    vi.mocked(db.tokens.redeem).mockResolvedValue(null);
    vi.mocked(db.tokens.findById).mockResolvedValue(null);

    const res = await request.post('/api/tokens/redeem').send({ token: 'abc123' });
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  it('returns 409 when token was already redeemed', async () => {
    vi.mocked(db.tokens.redeem).mockResolvedValue(null);
    vi.mocked(db.tokens.findById).mockResolvedValue({
      id: 'abc123',
      competitionId: 'c1',
      restaurantId: 'r1',
      createdAt: new Date().toISOString(),
      redeemedAt: new Date().toISOString(), // already stamped
    });

    const res = await request.post('/api/tokens/redeem').send({ token: 'abc123' });
    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
  });

  it('returns 200 and competition/restaurant ids on success', async () => {
    vi.mocked(db.tokens.redeem).mockResolvedValue({
      id: 'abc123',
      competitionId: 'c1',
      restaurantId: 'r1',
      createdAt: new Date().toISOString(),
      redeemedAt: new Date().toISOString(),
    });

    const res = await request.post('/api/tokens/redeem').send({ token: 'abc123' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, competitionId: 'c1', restaurantId: 'r1' });
    // findById should NOT be called — the atomic path short-circuits
    expect(db.tokens.findById).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// POST /api/tokens/generate  (admin-open in test/dev because ADMIN_KEY unset)
// ---------------------------------------------------------------------------
describe('POST /api/tokens/generate', () => {
  it('returns 400 when competitionId is missing', async () => {
    const res = await request.post('/api/tokens/generate').send({ restaurantId: 'r1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when competitionId is not found', async () => {
    vi.mocked(db.competitions.findById).mockResolvedValue(null);
    vi.mocked(db.restaurants.findById).mockResolvedValue({
      id: 'r1', name: 'Burger Barn', competitionId: 'c1',
      location: 'Downtown', image: '', active: true,
    });

    const res = await request.post('/api/tokens/generate').send({ competitionId: 'c1', restaurantId: 'r1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/competitionId/);
  });

  it('returns 400 when restaurant does not belong to competition', async () => {
    vi.mocked(db.competitions.findById).mockResolvedValue({
      id: 'c1', title: 'Best Burger', category: 'Burgers', city: 'LA',
      quarter: 'Q1 2026', description: '', image: '', active: true, createdAt: '',
    });
    vi.mocked(db.restaurants.findById).mockResolvedValue({
      id: 'r1', name: 'Burger Barn', competitionId: 'other-competition',
      location: 'Downtown', image: '', active: true,
    });

    const res = await request.post('/api/tokens/generate').send({ competitionId: 'c1', restaurantId: 'r1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/competition/i);
  });

  it('creates and returns tokens on success', async () => {
    vi.mocked(db.competitions.findById).mockResolvedValue({
      id: 'c1', title: 'Best Burger', category: 'Burgers', city: 'LA',
      quarter: 'Q1 2026', description: '', image: '', active: true, createdAt: '',
    });
    vi.mocked(db.restaurants.findById).mockResolvedValue({
      id: 'r1', name: 'Burger Barn', competitionId: 'c1',
      location: 'Downtown', image: '', active: true,
    });
    vi.mocked(db.tokens.create).mockResolvedValue({
      id: 'tok1', competitionId: 'c1', restaurantId: 'r1',
      createdAt: new Date().toISOString(), redeemedAt: null,
    });

    const res = await request.post('/api/tokens/generate').send({ competitionId: 'c1', restaurantId: 'r1', count: 1 });
    expect(res.status).toBe(200);
    expect(res.body.tokens).toHaveLength(1);
    expect(res.body.tokens[0].token).toBe('tok1');
  });
});
