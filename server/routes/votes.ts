import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';
import { cacheInvalidate } from '../cache.js';

const router = Router();

// POST /api/votes
router.post('/', asyncRoute(async (req: Request, res: Response) => {
  const { token, scores, notes = '' } = req.body as {
    token: string;
    scores: Record<string, number>;
    notes?: string;
  };

  if (!token || !scores || typeof scores !== 'object' || Array.isArray(scores)) {
    res.status(400).json({ ok: false, error: 'token and scores are required' });
    return;
  }

  const scoreEntries = Object.entries(scores);
  if (scoreEntries.length === 0) {
    res.status(400).json({ ok: false, error: 'scores must have at least one criterion' });
    return;
  }
  if (!scoreEntries.every(([, v]) => typeof v === 'number' && v >= 1 && v <= 10)) {
    res.status(400).json({ ok: false, error: 'each score must be a number between 1 and 10' });
    return;
  }

  const tokenRecord = await db.tokens.findById(token);
  if (!tokenRecord) {
    res.status(404).json({ ok: false, error: 'Invalid token' });
    return;
  }
  if (!tokenRecord.redeemedAt) {
    res.status(403).json({ ok: false, error: 'Token has not been verified yet' });
    return;
  }

  const vote = await db.votes.create({
    tokenId: token,
    competitionId: tokenRecord.competitionId,
    restaurantId: tokenRecord.restaurantId,
    scores,
    notes: String(notes).slice(0, 1000),
  });

  // null means the unique index rejected a duplicate concurrent submission.
  if (!vote) {
    res.status(409).json({ ok: false, error: 'A vote has already been submitted for this token' });
    return;
  }

  cacheInvalidate(`leaderboard:${tokenRecord.competitionId}`);
  res.json({ ok: true, voteId: vote.id });
}));

export default router;
