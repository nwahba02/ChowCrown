import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import contactRoutes from '../routes/contact.js';

vi.mock('../db.js', () => ({
  db: {
    contacts: { create: vi.fn() },
  },
}));

import { db } from '../db.js';

const VALID_BODY = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  subject: 'General Inquiry',
  message: 'Hello, I have a question.',
};

const app = express();
app.use(express.json());
app.use('/api/contact', contactRoutes);

const request = supertest(app);

beforeEach(() => vi.clearAllMocks());

describe('POST /api/contact — validation', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request.post('/api/contact').send({ ...VALID_BODY, name: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when name exceeds 100 chars', async () => {
    const res = await request.post('/api/contact').send({ ...VALID_BODY, name: 'a'.repeat(101) });
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is malformed', async () => {
    const res = await request.post('/api/contact').send({ ...VALID_BODY, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when subject is not one of the allowed values', async () => {
    const res = await request.post('/api/contact').send({ ...VALID_BODY, subject: 'Spam' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is empty', async () => {
    const res = await request.post('/api/contact').send({ ...VALID_BODY, message: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when message exceeds 2000 chars', async () => {
    const res = await request.post('/api/contact').send({ ...VALID_BODY, message: 'x'.repeat(2001) });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/contact — success', () => {
  it('stores the message and returns ok: true', async () => {
    vi.mocked(db.contacts.create).mockResolvedValue({
      id: 'c1',
      ...VALID_BODY,
      submittedAt: new Date().toISOString(),
    });

    const res = await request.post('/api/contact').send(VALID_BODY);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(db.contacts.create).toHaveBeenCalledOnce();
  });

  it('lower-cases the email before storing', async () => {
    vi.mocked(db.contacts.create).mockResolvedValue({
      id: 'c1', ...VALID_BODY, submittedAt: new Date().toISOString(),
    });

    await request.post('/api/contact').send({ ...VALID_BODY, email: 'Jane@EXAMPLE.COM' });
    const stored = vi.mocked(db.contacts.create).mock.calls[0][0];
    expect(stored.email).toBe('jane@example.com');
  });
});
