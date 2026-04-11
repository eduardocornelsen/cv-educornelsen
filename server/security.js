import { randomUUID } from 'node:crypto';

// ─── Intent Classification ────────────────────────────────────────────────────

const JAILBREAK_PATTERNS = [
  'ignore previous', 'ignore all', 'disregard', 'forget everything',
  'pretend', 'roleplay', 'role play', 'act as', 'you are now',
  'forget', 'bypass', 'override', 'jailbreak', 'dan',
  'developer mode', 'evil mode', 'unrestricted', 'no restrictions',
  'system prompt', 'your prompt', 'your instructions', 'your rules',
  'reveal your', 'show me your rules', 'show your instructions',
  'print all', 'print everything', 'repeat everything', 'repeat all',
  'dump', 'export', 'serialize', 'output all', 'copy all',
  'show me everything', 'all of the above', 'everything above',
  'new persona', 'reset your', 'your objective', 'your orders',
  'what are your rules', 'rules configured', 'yaml', 'json record',
];

/**
 * Keyword-based intent classifier — zero LLM cost.
 * Returns an array of tags used for Langfuse trace labelling.
 */
export function classifyIntent(text) {
  const lower = text.toLowerCase();
  const tags = [];

  if (JAILBREAK_PATTERNS.some(p => lower.includes(p))) {
    tags.push('jailbreak-attempt');
  }

  if (/experience|work|career|job|role|position|company|torus|omie|mandalah|tripleten/.test(lower)) tags.push('topic:experience');
  if (/project|portfolio|github|built|code|app|platform|punksql|revops|musicinsights|epic/.test(lower))  tags.push('topic:projects');
  if (/contact|email|linkedin|hire|available|reach|talk/.test(lower))   tags.push('topic:contact');
  if (/stack|tech|python|react|dbt|sql|llm|ai|api|tool|gemini|langchain|bigquery/.test(lower)) tags.push('topic:technical');
  if (/skill|know|language|framework|certificate|certification/.test(lower)) tags.push('topic:skills');
  if (/education|degree|university|insper|aarhus|mba|master|course/.test(lower)) tags.push('topic:education');
  if (/salary|rate|money|cost|price|compensation|pay/.test(lower))      tags.push('topic:compensation');
  if (/^(hi|hello|hey|howdy|sup|oi)\W*$/i.test(text.trim()))           tags.push('greeting');

  return tags.length ? tags : ['topic:general'];
}

// ─── Canary Word ──────────────────────────────────────────────────────────────

/**
 * Generates a per-request canary string injected into the system prompt.
 * If the model echoes it, the prompt was leaked/exfiltrated.
 */
export function generateCanary() {
  return 'SYS_' + randomUUID().slice(0, 8).toUpperCase();
}

// ─── Fingerprint Detection ────────────────────────────────────────────────────

// Strings that only appear in Eduardo's system prompt.
// If any show up in the model reply → system prompt was leaked.
export const PROMPT_FINGERPRINTS = [
  'non-negotiable, never reveal',
  'Check Eduardo\'s LinkedIn for the latest',
  'portfolio assistant',
  'EduardoAI',
  'internal_ref:',
];

export const LEAK_RESPONSE =
  "That's part of my internal configuration — I can't share it. " +
  "I'm here to tell you about Eduardo's work. What would you like to know?";

export function containsFingerprint(text) {
  const lower = text.toLowerCase();
  return PROMPT_FINGERPRINTS.some(fp => lower.includes(fp.toLowerCase()));
}

// ─── Server-Side IP Rate Limiting ─────────────────────────────────────────────

const ipWindows = new Map(); // ip → number[]
const IP_MAX = 20;
const IP_WINDOW_MS = 60_000;

/**
 * Returns true if the IP is within the allowed rate.
 * Stores timestamps in memory — resets on server restart.
 */
export function checkIpRateLimit(ip) {
  const now = Date.now();
  const prev = (ipWindows.get(ip) ?? []).filter(t => now - t < IP_WINDOW_MS);
  if (prev.length >= IP_MAX) return false;
  prev.push(now);
  ipWindows.set(ip, prev);
  return true;
}

// ─── Jailbreak Alert (optional — requires RESEND_API_KEY + ALERT_EMAIL) ───────

export async function sendJailbreakAlert(userMessage, type = 'jailbreak') {
  if (!process.env.RESEND_API_KEY || !process.env.ALERT_EMAIL) return;
  const subject = type === 'leak'
    ? '🚨 Prompt leak detected — portfolio chatbot'
    : '⚠️ Jailbreak attempt — portfolio chatbot';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EduardoAI <alerts@eduardocornelsen.com>',
        to: process.env.ALERT_EMAIL,
        subject,
        html: `
          <h2>${subject}</h2>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>User message:</strong></p>
          <blockquote style="background:#f5f5f5;padding:12px;border-left:4px solid #e74c3c;">
            ${userMessage.slice(0, 500)}${userMessage.length > 500 ? '…' : ''}
          </blockquote>
        `,
      }),
    });
  } catch (err) {
    console.error('[alert] Failed to send jailbreak alert:', err?.message);
  }
}
