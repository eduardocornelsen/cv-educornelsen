// ⚠ instrumentation MUST be imported first — initialises OTel before any other module
import './instrumentation.js';
import express from 'express';
import compression from 'compression';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { streamChat } from './chatHandler.js';
import { checkIpRateLimit } from './security.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 8080;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY environment variable is not set.');
  process.exit(1);
}

const app = express();

app.use(compression({ level: 6 }));
app.use(express.json({ limit: '50kb' }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com https://cdnjs.cloudflare.com https://cdn.plot.ly",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://us.cloud.langfuse.com https://cdn.plot.ly",
    "frame-src 'none'",
    "object-src 'none'",
  ].join('; '));
  next();
});

// ─── POST /api/chat (SSE) ─────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  // Server-side IP rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
    ?? req.socket.remoteAddress
    ?? 'unknown';
    
  if (!checkIpRateLimit(ip)) {
    return res.status(429).json({ error: 'ERR: rate limit exceeded — try again in a minute' });
  }

  const { message, history = [], sessionId } = req.body ?? {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: 'message too long (max 500 chars)' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const t0 = Date.now();

  try {
    const result = await streamChat({
      message: message.trim(),
      history,
      apiKey: GEMINI_API_KEY,
      sessionId: sessionId ?? null,
      write: chunk => res.write(chunk),
    });

    console.log(JSON.stringify({
      event: 'chat',
      sessionId: sessionId ?? null,
      ip,
      costUsd: result?.cost?.total ?? 0,
      latencyMs: Date.now() - t0,
    }));
  } catch (_err) {
    // streamChat already wrote the error event — just end cleanly
  }

  res.end();
});

// ─── Resume PDF ───────────────────────────────────────────────────────────────
app.get('/Eduardo_Cornelsen_Data_Analyst_q2_2026.pdf', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  res.setHeader('Content-Disposition', 'attachment; filename="Eduardo_Cornelsen_Data_Analyst_q2_2026.pdf"');
  res.sendFile(join(DIST, 'Eduardo_Cornelsen_Data_Analyst_q2_2026.pdf'));
});

// ─── Static files ─────────────────────────────────────────────────────────────
app.use('/assets', express.static(join(DIST, 'assets'), {
  maxAge: '1y', immutable: true, index: false,
}));

app.get('/index.html', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(join(DIST, 'index.html'));
});

app.use(express.static(DIST, {
  maxAge: '1d',
  index: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

app.get('/{*path}', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(join(DIST, 'index.html'));
});

createServer(app).listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
