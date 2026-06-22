import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { zip } from 'fflate';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';

const router = Router();

const isProd = process.env.NODE_ENV === 'production';

function checkAdmin(req: Request, res: Response): boolean {
  const adminKey = process.env.ADMIN_KEY;
  if (isProd || adminKey) {
    if (req.headers['x-admin-key'] !== adminKey) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }
  }
  return true;
}

// POST /api/tokens/generate
router.post('/generate', asyncRoute(async (req: Request, res: Response) => {
  if (!checkAdmin(req, res)) return;

  const { competitionId, restaurantId, count = 1 } = req.body as {
    competitionId: string;
    restaurantId: string;
    count?: number;
  };

  if (!competitionId || !restaurantId) {
    res.status(400).json({ error: 'competitionId and restaurantId are required' });
    return;
  }

  const [competition, restaurant] = await Promise.all([
    db.competitions.findById(competitionId),
    db.restaurants.findById(restaurantId),
  ]);
  if (!competition) {
    res.status(400).json({ error: 'competitionId not found' });
    return;
  }
  if (!restaurant) {
    res.status(400).json({ error: 'restaurantId not found' });
    return;
  }
  if (restaurant.competitionId !== competitionId) {
    res.status(400).json({ error: 'Restaurant does not belong to the specified competition' });
    return;
  }

  const n = Math.min(Math.max(1, Number(count) || 1), 500);
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  const tokens = await Promise.all(
    Array.from({ length: n }, () => db.tokens.create(competitionId, restaurantId))
  );

  res.json({
    tokens: tokens.map((t) => ({
      token: t.id,
      url: `${appUrl}/?vote=${t.id}`,
      createdAt: t.createdAt,
    })),
  });
}));

// POST /api/tokens/generate-zip
// Generates up to 2000 tokens and returns a ZIP of QR code PNGs + manifest.csv.
// Intended for bulk print runs shipped to restaurants.
router.post('/generate-zip', asyncRoute(async (req: Request, res: Response) => {
  if (!checkAdmin(req, res)) return;

  const { competitionId, restaurantId, count = 100 } = req.body as {
    competitionId: string;
    restaurantId: string;
    count?: number;
  };

  if (!competitionId || !restaurantId) {
    res.status(400).json({ error: 'competitionId and restaurantId are required' });
    return;
  }

  const [competition, restaurant] = await Promise.all([
    db.competitions.findById(competitionId),
    db.restaurants.findById(restaurantId),
  ]);
  if (!competition) { res.status(400).json({ error: 'competitionId not found' }); return; }
  if (!restaurant)  { res.status(400).json({ error: 'restaurantId not found' }); return; }
  if (restaurant.competitionId !== competitionId) {
    res.status(400).json({ error: 'Restaurant does not belong to the specified competition' });
    return;
  }

  const n = Math.min(Math.max(1, Number(count) || 1), 2000);
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Single DB round-trip for the whole batch
  const tokens = await db.tokens.createBatch(competitionId, restaurantId, n);

  // Build all files in memory then zip — fine for admin bulk ops (peak ~50 MB for 2000 codes)
  const files: Record<string, Uint8Array> = {};

  // manifest.csv — useful for the print vendor and internal tracking
  const csvRows = [
    'index,token_id,vote_url,competition,restaurant,created_at',
    ...tokens.map((t, i) =>
      `${i + 1},${t.id},${appUrl}/?vote=${t.id},"${competition.title}","${restaurant.name}",${t.createdAt}`
    ),
  ];
  files['manifest.csv'] = new TextEncoder().encode(csvRows.join('\n'));

  // One PNG per token — 600px is crisp at standard print densities
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const pngBuffer = await QRCode.toBuffer(`${appUrl}/?vote=${t.id}`, {
      type: 'png',
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    files[`${String(i + 1).padStart(4, '0')}_${t.id}.png`] = new Uint8Array(pngBuffer);
  }

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(files, { level: 5 }, (err, data) => (err ? reject(err) : resolve(data)));
  });

  const safeName = restaurant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeName}_qr_${Date.now()}.zip`;
  const outDir = path.join(process.cwd(), 'qr-exports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, Buffer.from(zipped));

  res.json({ ok: true, savedTo: `qr-exports/${filename}`, count: n });
}));

// POST /api/tokens/generate-sheet
// Generates up to 500 tokens and returns a self-contained print-ready HTML page.
// Open in a browser → Ctrl+P → Save as PDF for in-house printing.
router.post('/generate-sheet', asyncRoute(async (req: Request, res: Response) => {
  if (!checkAdmin(req, res)) return;

  const { competitionId, restaurantId, count = 40 } = req.body as {
    competitionId: string;
    restaurantId: string;
    count?: number;
  };

  if (!competitionId || !restaurantId) {
    res.status(400).json({ error: 'competitionId and restaurantId are required' });
    return;
  }

  const [competition, restaurant] = await Promise.all([
    db.competitions.findById(competitionId),
    db.restaurants.findById(restaurantId),
  ]);
  if (!competition) { res.status(400).json({ error: 'competitionId not found' }); return; }
  if (!restaurant)  { res.status(400).json({ error: 'restaurantId not found' }); return; }
  if (restaurant.competitionId !== competitionId) {
    res.status(400).json({ error: 'Restaurant does not belong to the specified competition' });
    return;
  }

  const n = Math.min(Math.max(1, Number(count) || 1), 500);
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  const tokens = await db.tokens.createBatch(competitionId, restaurantId, n);

  // Generate all QR data URLs in parallel (they're small enough to hold in memory)
  const qrDataUrls = await Promise.all(
    tokens.map((t) =>
      QRCode.toDataURL(`${appUrl}/?vote=${t.id}`, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
    )
  );

  const html = buildPrintSheet({
    restaurantName: restaurant.name,
    competitionTitle: competition.title,
    tokens,
    qrDataUrls,
    appUrl,
    total: n,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}));

// POST /api/tokens/redeem
router.post('/redeem', asyncRoute(async (req: Request, res: Response) => {
  const { token } = req.body as { token: string };

  if (!token) {
    res.status(400).json({ ok: false, error: 'token is required' });
    return;
  }

  const redeemed = await db.tokens.redeem(token);
  if (redeemed) {
    res.json({ ok: true, competitionId: redeemed.competitionId, restaurantId: redeemed.restaurantId });
    return;
  }

  const existing = await db.tokens.findById(token);
  if (!existing) {
    res.status(404).json({ ok: false, error: 'Invalid QR code.' });
    return;
  }
  res.status(409).json({ ok: false, error: 'This QR code has already been used.' });
}));

// --- Print sheet HTML builder ---

interface SheetParams {
  restaurantName: string;
  competitionTitle: string;
  tokens: { id: string; createdAt: string }[];
  qrDataUrls: string[];
  appUrl: string;
  total: number;
}

function buildPrintSheet(p: SheetParams): string {
  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const items = p.tokens.map((t, i) => `
    <div class="qr-item">
      <div class="seq">#${String(i + 1).padStart(4, '0')}</div>
      <img src="${p.qrDataUrls[i]}" alt="QR code ${i + 1}" />
      <div class="rest-name">${escapeHtml(p.restaurantName)}</div>
      <div class="comp-name">${escapeHtml(p.competitionTitle)}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>QR Sheet — ${escapeHtml(p.restaurantName)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #f5f5f5;
    color: #111;
  }

  /* Screen-only toolbar */
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #1a1a1a;
    color: #fff;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .toolbar h1 { font-size: 16px; font-weight: 600; }
  .toolbar p  { font-size: 13px; opacity: 0.6; margin-top: 2px; }
  .toolbar button {
    background: #FF6B2D;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .toolbar button:hover { opacity: 0.88; }

  /* Print area */
  .sheet {
    max-width: 8.5in;
    margin: 24px auto;
    padding: 0 16px;
  }

  .sheet-header {
    border-bottom: 2px solid #111;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .sheet-header h2 { font-size: 20px; font-weight: 700; }
  .sheet-header p  { font-size: 12px; color: #555; margin-top: 4px; }

  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .qr-item {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 6px 6px;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .qr-item .seq {
    font-size: 9px;
    color: #aaa;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .qr-item img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
  }

  .qr-item .rest-name {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 5px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .qr-item .comp-name {
    font-size: 7px;
    color: #888;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Print overrides */
  @page { size: letter portrait; margin: 0.45in; }

  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; padding: 0; max-width: 100%; }
    .grid { gap: 7px; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <div>
    <h1>${escapeHtml(p.restaurantName)} — QR Code Sheet</h1>
    <p>${escapeHtml(p.competitionTitle)} &nbsp;·&nbsp; ${p.total} codes &nbsp;·&nbsp; Generated ${generatedAt}</p>
  </div>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>

<div class="sheet">
  <div class="sheet-header">
    <h2>${escapeHtml(p.restaurantName)}</h2>
    <p>${escapeHtml(p.competitionTitle)} &nbsp;·&nbsp; ${p.total} unique single-use QR codes &nbsp;·&nbsp; ${generatedAt}</p>
  </div>
  <div class="grid">
    ${items}
  </div>
</div>

</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default router;
