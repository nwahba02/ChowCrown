import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import tokenRoutes from './routes/tokens.js';
import voteRoutes from './routes/votes.js';
import competitionRoutes from './routes/competitions.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import statsRoutes from './routes/stats.js';
import { errorHandler, asyncRoute } from './middleware.js';
import { logger } from './logger.js';
import { db, closeDb } from './db.js';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.ADMIN_KEY) {
  logger.error('ADMIN_KEY must be set in production (NODE_ENV=production)');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);

// Security headers. CSP is omitted here — the React build uses inline scripts
// (Vite injects them) that would require per-build nonces to whitelist properly.
app.use(helmet({ contentSecurityPolicy: false }));

// Allow the configured app origin + localhost in dev.
const allowedOrigins = new Set(['http://localhost:3000', 'http://localhost:3001']);
if (process.env.APP_URL) allowedOrigins.add(process.env.APP_URL.replace(/\/$/, ''));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  allowedHeaders: ['Content-Type', 'x-admin-key'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '10kb' }));

// Per-route rate limits.
const redeemLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const voteLimiter     = rateLimit({ windowMs: 60 * 60 * 1000, max: 5,  standardHeaders: true, legacyHeaders: false });
const generateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const contactLimiter  = rateLimit({ windowMs: 60 * 60 * 1000, max: 5,  standardHeaders: true, legacyHeaders: false });
// QR bulk generation is CPU/DB-heavy — tighter per-hour limit
const qrLimiter       = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

app.use('/api/tokens/generate-zip',   qrLimiter);
app.use('/api/tokens/generate-sheet', qrLimiter);
app.use('/api/tokens/generate', generateLimiter);
app.use('/api/tokens/redeem', redeemLimiter);
app.use('/api/tokens', tokenRoutes);
app.use('/api/votes', voteLimiter, voteRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/stats', statsRoutes);

// Health check — verifies DB connectivity, not just process liveness.
app.get('/api/health', asyncRoute(async (_req, res) => {
  await db.ping();
  res.json({ ok: true, ts: Date.now() });
}));

// Serve the Vite-built frontend when running in production (npm run build first).
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'API server started');
  if (!process.env.ADMIN_KEY) {
    logger.warn('ADMIN_KEY not set — /api/tokens/generate is unprotected (dev mode)');
  }
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
  // Force-exit if connections don't drain within 10 s.
  setTimeout(() => {
    logger.error('forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
