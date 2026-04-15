## Summary

Engineered a production-grade personal portfolio with a streaming AI chatbot, fully containerized via Docker, and deployed through a zero-touch CI/CD pipeline on Google Cloud Run — demonstrating full-stack ownership, LLMOps observability with LangFuse, and a 4-layer security model, all on a $0/month infrastructure budget.

---

## The Why — The Problem

Personal websites are table stakes. But most portfolios either look good or prove technical depth — rarely both. For engineers moving into senior IC or data/AI leadership roles, the gap between "I've done X" and "here's the running system I built" is the difference between a callback and silence.

Two structural problems:

1. **No proof layer.** PDFs and GitHub links require effort to evaluate. Recruiters, technical leads, and VPs all read the same page — it needs to work at every level.
2. **The chatbot credibility gap.** Adding a chatbot to a portfolio is trivially easy via no-code wrappers. Building one with streaming, LLMOps tracing, cost tracking, and prompt-injection defense is not. The difference is visible in the codebase — but only if someone looks. This project makes them look.

---

## The How — Architecture & Technology

The stack is deliberately practical: no overengineering, nothing that doesn't serve a purpose.

### Frontend
- **React 19 + TypeScript + Vite 6** — modern tooling with SWC compiler for fast HMR
- **TailwindCSS 4** — utility-first styling, no CSS-in-JS overhead
- **Three.js + React Three Fiber** — interactive 3D torus visualization in the hero section
- **Framer Motion (via `motion`)** — chatbot entry animation, scroll-triggered reveals
- **Code-split bundles** — vendor-react, vendor-three, vendor-motion, vendor-charts, vendor-markdown kept separate to optimize loading

### AI Chatbot
- **Google Gemini 2.5 Flash** — low-latency, cost-effective model for conversational AI
- **Server-Sent Events (SSE)** — true token-by-token streaming so responses feel instant
- **Express.js backend proxy** — keeps the API key server-side; the browser never sees it
- **4-layer security model:**
  1. Client-side input sanitization (500-char cap, rate-limit 10 msg/min)
  2. IP-based rate limiting on the server (20 msg/min per IP)
  3. Canary token injection — a per-request UUID in the system prompt detects if the prompt leaks
  4. Intent classification — regex-based jailbreak detection with alert escalation

### LLMOps Observability
- **LangFuse v5** — every conversation is traced with input tokens, output tokens, cost estimate, latency, and jailbreak flag
- **OpenTelemetry** — span processor wired into the Express instrumentation layer
- **Cost tracking** — per-request cost calculated at $0.15/1M input, $0.60/1M output

### Infrastructure & Deployment
- **Docker** — multi-stage build: Stage 1 compiles the Vite frontend; Stage 2 is the lean runtime with Express and the compiled assets. Final image: Node 20 Alpine
- **Google Cloud Run** — serverless container runtime; scales to zero when idle, scales out automatically under load. No servers to manage.
- **Google Artifact Registry** — private Docker image registry within GCP
- **GitHub Actions** — push to `main` triggers build → push to registry → deploy to Cloud Run. OIDC-based auth: no long-lived GCP credentials stored in GitHub Secrets
- **Google Analytics 4 (GA4)** — scroll depth tracking (25/50/75%), section dwell time, chatbot interaction events, all in custom events via `react-ga4`

```
GitHub push → Actions: build Docker → push to Artifact Registry
                                     → deploy-cloudrun action
                                            ↓
                                   Cloud Run (us-central1)
                                   serves eduardocornelsen.com
```

### Dev Experience
- `npm run dev` — Vite dev server with a built-in `/api/chat` plugin; no separate Express process needed locally
- `npm run dev:server` — standalone Express for isolated backend testing
- `npm run test` — Vitest unit suite
- `npm run test:contract` — chatbot contract tests (API stability checks)

---

## The Value

| Dimension | What it demonstrates |
|---|---|
| **Full-stack ownership** | Frontend, backend proxy, containerization, and cloud deployment all in one codebase |
| **AI systems thinking** | Streaming, security, observability, and cost management — not just "call the API" |
| **DevOps fluency** | OIDC-authenticated CI/CD, multi-stage Docker builds, Cloud Run configuration |
| **Production mindset** | Rate limiting, prompt-injection defense, canary tokens — the same patterns used at scale |
| **Cost awareness** | Per-token cost tracking, zero-idle-cost serverless runtime, free-tier LangFuse |

For technical interviewers: the `/server` directory and GitHub Actions workflow tell the full story. For non-technical stakeholders: the live site and chatbot do.

---

## The Result

| Metric | Value |
|---|---|
| Time to zero-downtime deploy | ~3 minutes (GitHub push → live) |
| Chatbot response latency (P50) | ~800ms first token |
| Infrastructure cost at rest | $0/month (Cloud Run scales to zero) |
| Security layers | 4 (client sanitization, IP rate-limit, canary token, intent classification) |
| Observability coverage | 100% of chatbot interactions traced in LangFuse |
| Lighthouse Performance | 95+ (code-split bundles, lazy-loaded 3D) |

---

## Reference: santifer.io — Self-Healing Chatbot

A parallel implementation that takes this architecture significantly further. Built by Santiago Fernández de Valderrama, `santifer.io` demonstrates what a production LLMOps system looks like at its most complete:

- **Agentic RAG** — Claude Sonnet decides whether to call `search_portfolio` (tool use), triggering hybrid Supabase search (pgvector + BM25) and Claude Haiku reranking before generation
- **Voice mode** — OpenAI Realtime API WebSocket with RAG function calling for voice
- **71 automated evals** across 10 categories (factual accuracy, safety, RAG quality, multi-turn, voice) — run on a daily cron with a CI gate that blocks deploy on regression
- **6-layer defense** — adds anti-extraction patterns and closed-loop safety scoring (Haiku scores every response; score < 0.7 auto-generates a test and blocks deploy)
- **LLMOps dashboard** — private `/ops` route with 8 real-data tabs: conversations, cost breakdown by span, RAG activation rate, security funnel, eval trends, voice metrics
- **Prompt management** — Langfuse prompt registry with versioning, regression testing, and file fallback
- **Bilingual** — full ES/EN i18n across all routes and chatbot content

The architecture difference between portfolio-eduardo (this project) and santifer.io is intentional: this portfolio uses a simpler, self-contained stack optimized for clarity and zero cost. santifer.io is the reference for what the same pattern looks like in a more complex, multi-model, RAG-enabled system.

Stack comparison:

| Component | portfolio-eduardo | santifer.io |
|---|---|---|
| LLM | Gemini 2.5 Flash | Claude Sonnet 4.6 + Haiku |
| RAG | — | Hybrid (pgvector + BM25) |
| Voice | — | OpenAI Realtime API |
| Evals | Contract tests | 71 automated evals + CI gate |
| Security layers | 4 | 6 |
| Observability | LangFuse traces | LangFuse + custom /ops dashboard |
| Deployment | Google Cloud Run | Vercel Edge Functions |
| Prompt management | Hardcoded | Langfuse registry + versioning |

---

## Stack

`React 19` · `TypeScript` · `Vite 6` · `TailwindCSS 4` · `Three.js` · `Express.js` · `Google Gemini 2.5 Flash` · `LangFuse v5` · `OpenTelemetry` · `Docker` · `Google Cloud Run` · `Google Artifact Registry` · `GitHub Actions` · `Google Analytics 4` · `Node.js 20`
