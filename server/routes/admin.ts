import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';
import { timingSafeEqual, requireString, optionalString, optionalBoolean } from '../security.js';

const router = Router();

const isProd = process.env.NODE_ENV === 'production';

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_KEY;
  if (isProd || adminKey) {
    const provided = req.headers['x-admin-key'];
    if (typeof provided !== 'string' || !adminKey || !timingSafeEqual(provided, adminKey)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }
  next();
}

router.use(requireAdmin);

// POST /api/admin/competitions
router.post('/competitions', asyncRoute(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;

  const title       = requireString(body.title,       'title');
  const category    = requireString(body.category,    'category');
  const city        = requireString(body.city,        'city');
  const quarter     = requireString(body.quarter,     'quarter');
  const description = requireString(body.description, 'description');
  const image       = optionalString(body.image,      'image') ?? '';
  const active      = body.active !== undefined ? (body.active === true) : true;

  if (!title || !category || !city || !quarter || !description) {
    res.status(400).json({ error: 'title, category, city, quarter, and description are required' });
    return;
  }

  const competition = await db.competitions.create({ title, category, city, quarter, description, image, active });
  res.status(201).json({ competition });
}));

// POST /api/admin/restaurants
router.post('/restaurants', asyncRoute(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;

  const name          = requireString(body.name,          'name');
  const competitionId = requireString(body.competitionId, 'competitionId');
  const location      = requireString(body.location,      'location');
  const dish          = optionalString(body.dish,         'dish') ?? '';
  const city          = optionalString(body.city,         'city') ?? '';
  const description   = optionalString(body.description,  'description') ?? '';
  const image         = optionalString(body.image,        'image') ?? '';
  const active        = body.active !== undefined ? (body.active === true) : true;

  if (!name || !competitionId || !location) {
    res.status(400).json({ error: 'name, competitionId, and location are required' });
    return;
  }

  const competition = await db.competitions.findById(competitionId);
  if (!competition) {
    res.status(404).json({ error: 'Competition not found' });
    return;
  }

  const restaurant = await db.restaurants.create({ name, dish, competitionId, location, city, description, image, active });
  res.status(201).json({ restaurant });
}));

// GET /api/admin/competitions — list all (including inactive)
router.get('/competitions', asyncRoute(async (_req: Request, res: Response) => {
  const competitions = await db.competitions.listAll();
  res.json({ competitions });
}));

// PATCH /api/admin/competitions/:id
router.patch('/competitions/:id', asyncRoute(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  const title       = optionalString(body.title,       'title');
  const category    = optionalString(body.category,    'category');
  const city        = optionalString(body.city,        'city');
  const quarter     = optionalString(body.quarter,     'quarter');
  const description = optionalString(body.description, 'description');
  const image       = optionalString(body.image,       'image');
  const active      = optionalBoolean(body.active,     'active');

  if (title       !== undefined) updates.title       = title;
  if (category    !== undefined) updates.category    = category;
  if (city        !== undefined) updates.city        = city;
  if (quarter     !== undefined) updates.quarter     = quarter;
  if (description !== undefined) updates.description = description;
  if (image       !== undefined) updates.image       = image;
  if (active      !== undefined) updates.active      = active;

  const updated = await db.competitions.update(req.params.id, updates);
  if (!updated) { res.status(404).json({ error: 'Competition not found' }); return; }
  res.json({ competition: updated });
}));

// GET /api/admin/restaurants
router.get('/restaurants', asyncRoute(async (req: Request, res: Response) => {
  // Guard against NoSQL injection via query-string objects (e.g. ?competitionId[$ne]=)
  const raw = req.query.competitionId;
  const competitionId = typeof raw === 'string' ? raw : undefined;
  const restaurants = await db.restaurants.listAll(competitionId);
  res.json({ restaurants });
}));

// PATCH /api/admin/restaurants/:id
router.patch('/restaurants/:id', asyncRoute(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  const name          = optionalString(body.name,          'name');
  const dish          = optionalString(body.dish,          'dish');
  const location      = optionalString(body.location,      'location');
  const city          = optionalString(body.city,          'city');
  const description   = optionalString(body.description,   'description');
  const image         = optionalString(body.image,         'image');
  const competitionId = optionalString(body.competitionId, 'competitionId');
  const active        = optionalBoolean(body.active,       'active');

  if (name          !== undefined) updates.name          = name;
  if (dish          !== undefined) updates.dish          = dish;
  if (location      !== undefined) updates.location      = location;
  if (city          !== undefined) updates.city          = city;
  if (description   !== undefined) updates.description   = description;
  if (image         !== undefined) updates.image         = image;
  if (active        !== undefined) updates.active        = active;
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

// GET /api/admin/votes
router.get('/votes', asyncRoute(async (req: Request, res: Response) => {
  const raw = req.query.competitionId;
  const competitionId = typeof raw === 'string' ? raw : undefined;
  const votes = competitionId
    ? await db.votes.getByCompetition(competitionId)
    : await db.votes.getAll();
  res.json({ votes });
}));

// GET /api/admin/contacts
router.get('/contacts', asyncRoute(async (_req: Request, res: Response) => {
  const contacts = await db.contacts.list();
  res.json({ contacts });
}));

export default router;
