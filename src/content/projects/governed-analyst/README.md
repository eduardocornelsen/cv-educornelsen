# Governed AI Analyst for a Live E-commerce

**Status (2026):** the semantic layer, the margin and P&L reporting and the AI analyst run in production for a specialty-coffee e-commerce and subscription business. The multi-source ingestion and dbt pipeline (steps 1, 2 and 6) is the next version, built and tested against that store's data and not yet scheduled in production. The code is private because it holds a real client's data; this page describes the design.

## The problem

Small e-commerce owners see revenue in five dashboards and margin in none. Ad platforms report their own ROAS, the payment gateway takes its fee, freight and taxes come later, and nobody knows what a sale actually left in the bank. Asking a language model directly makes it worse: it invents numbers.

## What I built

1. **Ingestion.** Connectors for the ERP API and the store's database land raw records idempotently, with per-source sync state and encrypted credentials.
2. **dbt on Postgres.** Staging translates each source into one contract; an intermediate model deduplicates orders across sources with an explicit priority per field; marts compute contribution margin by channel, monthly P&L and moving-average cost of goods. Money stays in integer cents until the mart.
3. **Semantic schema.** The analyst sees a virtual schema of CTEs generated from one definition. A CI test fails if the dbt models drift from it. The tenant column does not exist in what the model can see.
4. **AI analyst.** The model writes SQL; the pipeline runs it under a read-only role, inside a read-only transaction, with a statement allowlist, a timeout, a forced LIMIT and row-level security per tenant.
5. **Number checker.** Before an answer is shown, every number in the model's text is matched against the query results. If a figure is not in the data, the answer is rejected.
6. **Golden metrics.** Frozen days are re-checked against the marts on every build, so a model change that moves a historical number fails loudly.

## What I learned

- A lexical SQL guardrail is not enough on its own. An earlier version had a cross-tenant hole through `query_to_xml`; the fix moved the first barrier into Postgres (role without `*_to_xml*`, `FORCE` RLS, `SET LOCAL` tenant per request).
- "Settled revenue" means something different in each source. Each staging model documents its definition and was validated against real figures, not memory.

## Stack

TypeScript (Next.js) · Python · dbt · PostgreSQL (Supabase) · Claude API
