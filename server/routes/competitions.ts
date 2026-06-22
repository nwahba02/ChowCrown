import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';
import { cacheGet, cacheSet } from '../cache.js';

const router = Router();

const RESULTS_TTL_MS = 30_000; // 30 seconds

// GET /api/competitions — list all active competitions
router.get('/', asyncRoute(async (_req: Request, res: Response) => {
  const competitions = await db.competitions.list();
  res.json({ competitions: competitions.filter((c) => c.active) });
}));

// GET /api/competitions/:id — single competition
router.get('/:id', asyncRoute(async (req: Request, res: Response) => {
  const competition = await db.competitions.findById(req.params.id);
  if (!competition) {
    res.status(404).json({ error: 'Competition not found' });
    return;
  }
  res.json({ competition });
}));

// GET /api/competitions/:id/restaurants — restaurants in a competition
router.get('/:id/restaurants', asyncRoute(async (req: Request, res: Response) => {
  const competition = await db.competitions.findById(req.params.id);
  if (!competition) {
    res.status(404).json({ error: 'Competition not found' });
    return;
  }
  const restaurants = await db.restaurants.listByCompetition(req.params.id);
  res.json({ restaurants });
}));

type LeaderboardResult = { competitionId: string; restaurants: unknown[] };

// GET /api/competitions/:id/results — leaderboard (cached 30 s)
router.get('/:id/results', asyncRoute(async (req: Request, res: Response) => {
  const cacheKey = `leaderboard:${req.params.id}`;
  const cached = cacheGet<LeaderboardResult>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const [votes, restaurants] = await Promise.all([
    db.votes.getByCompetition(req.params.id),
    db.restaurants.listByCompetition(req.params.id),
  ]);

  const byRestaurant: Record<string, { totalAvg: number; count: number }> = {};

  for (const vote of votes) {
    const criteriaValues = Object.values(vote.scores).filter((v) => typeof v === 'number');
    if (criteriaValues.length === 0) continue;
    const avg = criteriaValues.reduce((a, b) => a + b, 0) / criteriaValues.length;

    if (!byRestaurant[vote.restaurantId]) {
      byRestaurant[vote.restaurantId] = { totalAvg: 0, count: 0 };
    }
    byRestaurant[vote.restaurantId].totalAvg += avg;
    byRestaurant[vote.restaurantId].count += 1;
  }

  const restaurantMap = Object.fromEntries(restaurants.map((r) => [r.id, r]));

  const results = Object.entries(byRestaurant)
    .map(([restaurantId, { totalAvg, count }]) => ({
      restaurantId,
      restaurantName: restaurantMap[restaurantId]?.name ?? restaurantId,
      location: restaurantMap[restaurantId]?.location ?? '',
      avgScore: Number((totalAvg / count).toFixed(2)),
      voteCount: count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const payload: LeaderboardResult = { competitionId: req.params.id, restaurants: results };
  cacheSet(cacheKey, payload, RESULTS_TTL_MS);
  res.json(payload);
}));

export default router;
