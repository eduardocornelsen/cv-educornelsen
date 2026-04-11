/**
 * Contract test: validates that Langfuse trace metadata shape hasn't drifted.
 * Requires LANGFUSE_PUBLIC_KEY + LANGFUSE_SECRET_KEY in environment.
 * Skips gracefully when keys are absent (CI without observability).
 *
 * Usage: npm run test:contract
 */

const PUBLIC_KEY  = process.env.LANGFUSE_PUBLIC_KEY;
const SECRET_KEY  = process.env.LANGFUSE_SECRET_KEY;
const LANGFUSE_URL = process.env.LANGFUSE_HOST ?? process.env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com';

if (!PUBLIC_KEY || !SECRET_KEY) {
  console.warn('[contract] LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY not set — skipping');
  process.exit(0);
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.error(`  ❌ ${label}`);
  }
}

async function fetchLangfuse(path: string) {
  const auth = Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString('base64');
  const res = await fetch(`${LANGFUSE_URL}${path}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`Langfuse API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function run() {
  console.log('\n=== Chatbot Contract Tests ===\n');

  // Fetch the most recent 'chat' traces
  const data = await fetchLangfuse('/api/public/traces?name=chat&limit=5').catch((err: Error) => {
    console.error('Failed to fetch traces:', err.message);
    process.exit(1);
  });

  const traces = data?.data ?? [];

  if (traces.length === 0) {
    console.warn('[contract] No traces found — send a chatbot message first, then re-run.');
    process.exit(0);
  }

  console.log(`Validating ${traces.length} most recent trace(s)...\n`);

  for (const trace of traces) {
    console.log(`  Trace: ${trace.id} (${new Date(trace.timestamp).toLocaleString()})`);
    const meta = trace.metadata ?? {};

    // ── Tags ──────────────────────────────────────────────────────────────────
    assert(Array.isArray(trace.tags),                    'tags is an array');
    assert(trace.tags.some((t: string) => t.startsWith('topic:') || t === 'greeting' || t === 'jailbreak-attempt'),
      'has at least one intent tag');

    // ── Core metadata fields ──────────────────────────────────────────────────
    assert(typeof meta.messageCount === 'number',        'messageCount is a number');
    assert(typeof meta.lastUserMessage === 'string',     'lastUserMessage is a string');
    assert(meta.lastUserMessage.length <= 200,           'lastUserMessage ≤ 200 chars');
    assert(typeof meta.jailbreakDetected === 'boolean',  'jailbreakDetected is boolean');
    assert(typeof meta.leakDetected === 'boolean',       'leakDetected is boolean');
    assert(typeof meta.model === 'string',               'model is a string');

    // ── Performance ───────────────────────────────────────────────────────────
    assert(typeof meta.latencyMs === 'number',           'latencyMs is a number');
    assert(meta.latencyMs > 0,                           'latencyMs > 0');

    // ── Token usage ───────────────────────────────────────────────────────────
    assert(typeof meta.inputTokens === 'number',         'inputTokens is a number');
    assert(typeof meta.outputTokens === 'number',        'outputTokens is a number');

    // ── Cost structure ────────────────────────────────────────────────────────
    assert(typeof meta.cost === 'object' && meta.cost !== null, 'cost is an object');
    assert(typeof meta.cost?.input  === 'number',        'cost.input is a number');
    assert(typeof meta.cost?.output === 'number',        'cost.output is a number');
    assert(typeof meta.cost?.total  === 'number',        'cost.total is a number');
    assert(meta.cost?.total >= 0,                        'cost.total ≥ 0');

    console.log('');
  }

  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
