import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import voteRoutes from '../routes/votes.js';

vi.mock('../db.js', () => ({
  db: {
    tokens: { findById: vi.fn() },
    votes:  { create: vi.fn(), existsForToken: vi.fn() },
  },
}));

vi.mock('../cache.js', () => ({
  cacheGet:        vi.fn().mockReturnValue(null),
  cacheSet:        vi.fn(),
  cacheInvalidate: vi.fn(),
}));

import { db } from '../db.js';
import { cacheInvalidate } from '../cache.js';

const REDEEMED_TOKEN = {
  id: 'tok1',
  competitionId: 'c1',
  restaurantId: 'r1',
  createdAt: new Date().toISOString(),
  redeemedAt: new Date().toISOString(), // already redeemed = eligible to vote
};

const VALID_SCORES = { first_impressions: 8, flavor: 9, value: 7, build: 8, protein: 9, visual_appeal: 8 };

const app = express();
app.use(express.json());
app.use('/api/votes', voteRoutes);

const request = supertest(app);

beforeEach(() => vi.clearAllMocks());

describe('POST /api/votes — input validation', () => {
  it('returns 400 when token is missing', async () => {
    const res = await request.post('/api/votes').send({ scores: VALID_SCORES });
    expect(res.status).toBe(400);
  });

  it('returns 400 when scores is missing', async () => {
    const res = await request.post('/api/votes').send({ token: 'tok1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when scores is an array', async () => {
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: [8, 9] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when scores is empty', async () => {
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: {} });
    expect(res.status).toBe(400);
  });

  it('returns 400 when a score is below 1', async () => {
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: { flavor: 0 } });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/1 and 10/);
  });

  it('returns 400 when a score is above 10', async () => {
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: { flavor: 11 } });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/1 and 10/);
  });

  it('returns 400 when a score is not a number', async () => {
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: { flavor: 'great' } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/votes — token checks', () => {
  it('returns 404 when token does not exist', async () => {
    vi.mocked(db.tokens.findById).mockResolvedValue(null);
    const res = await request.post('/api/votes').send({ token: 'bad', scores: VALID_SCORES });
    expect(res.status).toBe(404);
  });

  it('returns 403 when token has not been redeemed yet', async () => {
    vi.mocked(db.tokens.findById).mockResolvedValue({
      ...REDEEMED_TOKEN,
      redeemedAt: null, // not redeemed
    });
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: VALID_SCORES });
    expect(res.status).toBe(403);
  });

  it('returns 409 when a duplicate vote is submitted concurrently', async () => {
    vi.mocked(db.tokens.findById).mockResolvedValue(REDEEMED_TOKEN);
    vi.mocked(db.votes.create).mockResolvedValue(null); // unique index rejected it
    const res = await request.post('/api/votes').send({ token: 'tok1', scores: VALID_SCORES });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/votes — success', () => {
  it('returns 200 and invalidates the leaderboard cache', async () => {
    vi.mocked(db.tokens.findById).mockResolvedValue(REDEEMED_TOKEN);
    vi.mocked(db.votes.create).mockResolvedValue({
      id: 'v1',
      tokenId: 'tok1',
      competitionId: 'c1',
      restaurantId: 'r1',
      scores: VALID_SCORES,
      notes: '',
      submittedAt: new Date().toISOString(),
    });

    const res = await request.post('/api/votes').send({ token: 'tok1', scores: VALID_SCORES });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, voteId: 'v1' });
    expect(cacheInvalidate).toHaveBeenCalledWith('leaderboard:c1');
  });

  it('truncates notes longer than 1000 chars', async () => {
    vi.mocked(db.tokens.findById).mockResolvedValue(REDEEMED_TOKEN);
    vi.mocked(db.votes.create).mockResolvedValue({
      id: 'v1', tokenId: 'tok1', competitionId: 'c1', restaurantId: 'r1',
      scores: VALID_SCORES, notes: '', submittedAt: new Date().toISOString(),
    });

    const longNote = 'x'.repeat(2000);
    await request.post('/api/votes').send({ token: 'tok1', scores: VALID_SCORES, notes: longNote });
    const callArg = vi.mocked(db.votes.create).mock.calls[0][0];
    expect(callArg.notes.length).toBeLessThanOrEqual(1000);
  });
});
