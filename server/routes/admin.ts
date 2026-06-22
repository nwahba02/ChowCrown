import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';

const router = Router();

const isProd = process.env.NODE_ENV === 'production';

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_KEY;
  // In production ADMIN_KEY is guaranteed set (index.ts exits otherwise).
  // In dev, if unset, allow through so local setup stays frictionless.
  if (isProd || adminKey) {
    if (req.headers['x-admin-key'] !== adminKey) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }
  next();
}

router.use(requireAdmin);

// POST /api/admin/competitions
// Body: { title, category, city, quarter, description, image?, active? }
router.post('/competitions', asyncRoute(async (req: Request, res: Response) => {
  const { title, category, city, quarter, description, image = '', active = true } = req.body as {
    title: string;
    category: string;
    city: string;
    quarter: string;
    description: string;
    image?: string;
    active?: boolean;
  };

  if (!title || !category || !city || !quarter || !description) {
    res.status(400).json({ error: 'title, category, city, quarter, and description are required' });
    return;
  }

  const competition = await db.competitions.create({ title, category, city, quarter, description, image, active });
  res.status(201).json({ competition });
}));

// POST /api/admin/restaurants
// Body: { name, dish, competitionId, location, image?, active? }
router.post('/restaurants', asyncRoute(async (req: Request, res: Response) => {
  const { name, dish = '', competitionId, location, image = '', active = true } = req.body as {
    name: string;
    dish?: string;
    competitionId: string;
    location: string;
    image?: string;
    active?: boolean;
  };

  if (!name || !competitionId || !location) {
    res.status(400).json({ error: 'name, competitionId, and location are required' });
    return;
  }

  const competition = await db.competitions.findById(competitionId);
  if (!competition) {
    res.status(404).json({ error: 'Competition not found' });
    return;
  }

  const restaurant = await db.restaurants.create({ name, dish, competitionId, location, image, active });
  res.status(201).json({ restaurant });
}));

// GET /api/admin/competitions — list all (including inactive)
router.get('/competitions', asyncRoute(async (_req: Request, res: Response) => {
  const competitions = await db.competitions.listAll();
  res.json({ competitions });
}));

// PATCH /api/admin/competitions/:id
router.patch('/competitions/:id', asyncRoute(async (req: Request, res: Response) => {
  const { title, category, city, quarter, description, image, active } = req.body as Partial<{
    title: string; category: string; city: string; quarter: string;
    description: string; image: string; active: boolean;
  }>;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (category !== undefined) updates.category = category;
  if (city !== undefined) updates.city = city;
  if (quarter !== undefined) updates.quarter = quarter;
  if (description !== undefined) updates.description = description;
  if (image !== undefined) updates.image = image;
  if (active !== undefined) updates.active = active;

  const updated = await db.competitions.update(req.params.id, updates);
  if (!updated) { res.status(404).json({ error: 'Competition not found' }); return; }
  res.json({ competition: updated });
}));

// GET /api/admin/restaurants — list all (optional ?competitionId filter)
router.get('/restaurants', asyncRoute(async (req: Request, res: Response) => {
  const competitionId = req.query.competitionId as string | undefined;
  const restaurants = await db.restaurants.listAll(competitionId);
  res.json({ restaurants });
}));

// PATCH /api/admin/restaurants/:id
router.patch('/restaurants/:id', asyncRoute(async (req: Request, res: Response) => {
  const { name, location, image, active, competitionId } = req.body as Partial<{
    name: string; location: string; image: string; active: boolean; competitionId: string;
  }>;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (location !== undefined) updates.location = location;
  if (image !== undefined) updates.image = image;
  if (active !== undefined) updates.active = active;
  if (competitionId !== undefined) updates.competitionId = competitionId;

  const updated = await db.restaurants.update(req.params.id, updates);
  if (!updated) { res.status(404).json({ error: 'Restaurant not found' }); return; }
  res.json({ restaurant: updated });
}));

// DELETE /api/admin/restaurants/:id
router.delete('/restaurants/:id', asyncRoute(async (req: Request, res: Response) => {
  const deleted = await db.restaurants.remove(req.params.id);
  if (!deleted) { res.status(404).json({ error: 'Restaurant not found' }); return; }
  res.json({ ok: true });
}));

// GET /api/admin/votes — list votes (optional ?competitionId filter)
router.get('/votes', asyncRoute(async (req: Request, res: Response) => {
  const competitionId = req.query.competitionId as string | undefined;
  const votes = competitionId
    ? await db.votes.getByCompetition(competitionId)
    : await db.votes.getAll();
  res.json({ votes });
}));

// GET /api/admin/contacts — view submitted contact messages
router.get('/contacts', asyncRoute(async (_req: Request, res: Response) => {
  const contacts = await db.contacts.list();
  res.json({ contacts });
}));

export default router;
