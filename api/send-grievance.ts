import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { to, cc, replyTo, subject, html } = req.body || {};
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing RESEND_API_KEY' });

  const recipient = process.env.STAGING_MODE === 'true' ? 'anupsl.aws1@gmail.com' : (to || 'anupsl.aws1@gmail.com');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'CivicWatch <onboarding@resend.dev>', to: [recipient], cc: cc ? [cc] : undefined, reply_to: replyTo, subject, html }),
  });
  const data = await r.json();
  return res.status(r.ok ? 200 : 500).json(data);
}