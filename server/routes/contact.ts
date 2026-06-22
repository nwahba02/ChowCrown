import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { db } from '../db.js';
import { asyncRoute } from '../middleware.js';

const router = Router();

const VALID_SUBJECTS = new Set(['General Inquiry', 'Restaurant Partnership', 'Technical Support', 'Press & Media']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RECIPIENT = 'thechowcrown@gmail.com';

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { type: 'login', user, pass },
  });
}

// POST /api/contact
router.post('/', asyncRoute(async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body as Record<string, unknown>;

  if (typeof name !== 'string' || !name.trim() || name.length > 100) {
    res.status(400).json({ ok: false, error: 'name is required (max 100 chars)' });
    return;
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 100) {
    res.status(400).json({ ok: false, error: 'valid email is required' });
    return;
  }
  if (typeof subject !== 'string' || !VALID_SUBJECTS.has(subject)) {
    res.status(400).json({ ok: false, error: 'invalid subject' });
    return;
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    res.status(400).json({ ok: false, error: 'message is required (max 2000 chars)' });
    return;
  }

  const phoneStr = typeof phone === 'string' ? phone.trim() : '';

  await db.contacts.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject,
    message: message.trim(),
  });

  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail({
      from: `"Chow Crown Contact" <${process.env.GMAIL_USER}>`,
      to: RECIPIENT,
      replyTo: email.trim(),
      subject: `[ChowCrown] ${subject} — from ${name.trim()}`,
      text: [
        `Name:    ${name.trim()}`,
        `Email:   ${email.trim()}`,
        phoneStr ? `Phone:   ${phoneStr}` : '',
        `Subject: ${subject}`,
        '',
        message.trim(),
      ].filter(Boolean).join('\n'),
      html: `
        <table style="font-family:sans-serif;font-size:14px;color:#222;border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px 0"><strong>Name</strong></td><td>${name.trim()}</td></tr>
          <tr><td style="padding:8px 0"><strong>Email</strong></td><td><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
          ${phoneStr ? `<tr><td style="padding:8px 0"><strong>Phone</strong></td><td>${phoneStr}</td></tr>` : ''}
          <tr><td style="padding:8px 0"><strong>Subject</strong></td><td>${subject}</td></tr>
        </table>
        <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
        <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;color:#222">${message.trim().replace(/</g, '&lt;')}</p>
      `,
    });
  }

  res.json({ ok: true });
}));

export default router;
