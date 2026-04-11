## The Problem

Marketing claims Google drove the lead. Sales credits LinkedIn. Finance wants ROAS by channel — by Monday morning. Everyone's pulling from different dashboards, and the answer to *"where should we spend next quarter?"* takes days of manual work to compute.

Most teams cobble together spreadsheets. I built the production system that answers that question in **15 seconds** — in plain English.

---

## The Core Insight

AI-to-SQL fails without a **source of truth**.

When an LLM writes SQL on behalf of a marketing manager who can't verify it, you get hallucinated metrics and decisions made on bad data. The fix isn't a better prompt — it's a **semantic layer**: define "ROAS" once in YAML, and every AI client, dashboard, and ML pipeline consumes the exact same formula forever.

> According to the 2025 Metabase Community Data Stack Report, average confidence in AI-generated queries is just **5.5/10** without a semantic layer. This project moves that to **deterministic, production-grade certainty**.

---

## What I Built

A **29-model dbt pipeline** processing 2.2M+ rows through four attribution models — first-touch, last-touch, linear, and time-decay — governed by MetricFlow. Layered on top: 7 MCP servers, an XGBoost lead scoring API, and BI dashboards feeding from a single governed data layer.

Three independent pillars, one spine:

| Pillar | What it does |
|---|---|
| **AI Layer** | Natural language → governed metric query → 15-second answer with charts |
| **ML Layer** | XGBoost lead scoring (93K rows) + FastAPI `/score` endpoint + MLflow tracking |
| **BI Layer** | Looker Studio dashboards + Streamlit app, all reading from the same semantic layer |

![Architecture](architecture.webp)

---

## Natural Language Queries

Seven MCP servers expose your marketing stack — Google Ads, Meta Ads, GA4, HubSpot, Salesforce — to any AI client. The same servers work identically with Claude Desktop, Gemini CLI, OpenCode, and Antigravity IDE. No code changes between clients.

![Query Demo](open-query.png)

**Example:**
> *"Show me blended ROAS across Google and Meta for Q1 2025, with attribution model comparison and lead quality breakdown."*

The system queries the semantic layer, pulls CRM pipeline data, and returns a formatted analysis with KPI cards and channel attribution in ~15 seconds.

![Marketing Dashboard](dashboard.webp)

---

## Why Five Warehouses?

Not because you'd run five in production — but to prove the semantic layer is truly warehouse-agnostic. Same dbt models, same MetricFlow metrics, same MCP interface, different execution engine. When someone says *"but we use Snowflake"* — you show it working on Snowflake.

---

## Key Results

| Metric | Value |
|---|---|
| Rows processed | 2.2M+ |
| dbt models | 29, fully materialized and tested |
| Attribution models | 4 (first-touch, last-touch, linear, time-decay) |
| MCP servers | 7 |
| AI clients supported | 4 (Claude, Gemini CLI, OpenCode, Antigravity) |
| Data warehouses | 5 (BigQuery, Snowflake, Databricks, DuckDB, Supabase) |
| ML training set | 93K rows |
| Monthly infrastructure cost | $0 base |

---

## Stack

`dbt Core` · `MetricFlow` · `BigQuery` · `DuckDB` · `Snowflake` · `Databricks` · `Supabase` · `MCP` · `XGBoost` · `MLflow` · `FastAPI` · `n8n` · `Looker Studio` · `Streamlit` · `Python` · `React`
