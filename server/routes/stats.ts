import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';
import { cacheGet, cacheSet } from '../cache.js';

const router = Router();

type StatsPayload = { competitions: number; restaurants: number; votes: number; cities: number };

// GET /api/stats — aggregate counts, cached for 60 s
router.get('/', asyncRoute(async (_req: Request, res: Response) => {
  const cacheKey = 'stats';
  const cached = cacheGet<StatsPayload>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const raw = await db.stats();
  const payload: StatsPayload = {
    competitions: raw.competitions,
    restaurants:  raw.restaurants,
    votes:        raw.votes,
    cities:       raw.cities.length,
  };

  cacheSet(cacheKey, payload, 60_000);
  res.json(payload);
}));

export default router;
