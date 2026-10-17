## The Problem

Small e-commerce owners see revenue in five dashboards and margin in none. Ad platforms report their own ROAS, the payment gateway takes its fee, freight and taxes arrive later, and nobody knows what a sale actually left in the bank. Asking a language model directly makes it worse: it invents numbers.

> *"How much did I actually keep this month?"*

**Analista IA** answers that question in plain language, with numbers that come from tested models and never from the model's imagination.

![Demo](demo.webp)

---

## Status, Honestly

- **In production:** the semantic layer, the margin and P&L reporting and the AI analyst run for a live specialty-coffee e-commerce through TorraHub.
- **Built and tested, not yet scheduled in production:** Analista IA's multi-source ingestion and dbt pipeline (steps 1, 2 and 6 below), validated against that store's data.
- The code is private because it holds a real client's data. The site is in Portuguese: [analistaia.com.br](https://www.analistaia.com.br).

---

## What I Built

1. **Ingestion.** Connectors for an ERP API and the store's database land raw records idempotently, with per-source sync state and encrypted credentials.
2. **dbt on Postgres.** Staging translates each source into one contract; an intermediate model deduplicates orders across sources with an explicit priority per field; marts compute contribution margin by channel, monthly P&L and moving-average cost of goods. Money stays in integer cents until the mart.
3. **Semantic schema.** The analyst sees a virtual schema of CTEs generated from one definition. A CI test fails if the dbt models drift from it. The tenant column does not exist in what the model can see.
4. **Guardrailed SQL.** The model writes SQL; the pipeline runs it under a read-only role, inside a read-only transaction, with a statement allowlist, a timeout, a forced LIMIT and row-level security per tenant.
5. **Number checker.** Before an answer is shown, every number in the model's text is matched against the query results. A figure that is not in the data is rejected.
6. **Golden metrics.** Frozen days are re-checked against the marts on every build, so a change that moves a historical number fails loudly.

![Home](home.webp)

---

## What I Learned

- A lexical SQL guardrail is not enough on its own. An earlier version had a cross-tenant hole through `query_to_xml`; the fix moved the first barrier into Postgres (a role without `*_to_xml*`, `FORCE` row-level security, `SET LOCAL` tenant per request).
- "Settled revenue" means something different in each source. Each staging model documents its definition, validated against real figures instead of memory.

---

## Stack

`TypeScript` · `Next.js` · `Python` · `dbt` · `PostgreSQL` · `Supabase` · `Claude API`
