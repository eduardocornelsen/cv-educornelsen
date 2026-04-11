## The Problem

Most B2B sales teams burn **60–70% of SDR time** on tasks that shouldn't require a human: manual prospecting, CRM data entry, and qualification calls that go nowhere. High-quality leads decay in the queue — the average inbound response time is 3 days, and response speed is the single biggest conversion lever.

> *"Why does it take 3 days to reach a lead who filled out a form?"*

**RevOps Lead Engine** answers that by removing the human bottleneck entirely — from lead discovery through CRM sync.

---

## What I Built

A **fully autonomous B2B sales pipeline** with ten integrated modules in one Streamlit command center.

![Cover](cover.jpg)

The pipeline runs end-to-end: ICP-driven discovery → multi-source enrichment → XAI lead scoring → automated 3-touch outreach → CRM sync → post-sales retention tracking. Each stage feeds the next. No manual handoffs.

---

## Explainable AI Lead Scoring

Every lead score (0–100) ships with a transparent explanation — no black-box model:

> `(+25 ICP) Strong revenue fit` · `(-30 Needs) Enterprise lock-in risk` · `(+15 Intent) Recent buying signals`

Any SDR can see exactly why a lead ranked where it did and prioritize their day accordingly. XAI isn't just a nice-to-have — it's what makes the score *actionable*.

---

## AI RevOps Copilot

Embedded directly inside the dashboard: a GenAI conversational interface that answers questions about pipeline risk, quota pacing, and revenue forecast.

One-click executive prompts for **CEO, VP Sales, and VP Revenue** personas — so a board-ready pipeline summary takes seconds, not slides.

---

## Revenue Scenario Modeler

Four adjustable levers: Lead Volume, Win Rate, ACV, Cycle Time. Adjust any lever and watch a **90-day S-curve revenue projection** update in real time, with AI commentary on whether the team will hit quota and what's driving the gap.

---

## Post-Sales & NDR Analytics

The dashboard extends past closed-won — tracking the full **BowTie Funnel**:

- Net Dollar Retention (NDR) and Gross Retention Rate
- Account Health across three risk tiers (Healthy · At Risk · Critical)
- Dynamic **ARR Composition Waterfall**: Starting ARR → New Logos → Expansion → Contraction → Churn → Ending ARR

Because the real revenue story doesn't end at the signature.

---

## Key Results

| Metric | Value |
|---|---|
| Pipeline modules | 10 end-to-end stages |
| Lead scoring range | 0–100 with XAI transparency per score |
| Revenue projection horizon | 90-day S-curve, 4 adjustable levers |
| NDR tracking | 3-tier Account Health + ARR Waterfall |
| Outreach automation | 3-touch email cadence with response classification |
| Pipeline visibility | Real-time, filterable by rep and date range |

---

## Stack

`Python 3.10` · `Streamlit` · `Plotly` · `FastAPI` · `Pydantic v2` · `SQLite` · `LangChain` · `Faker` · `pytest`
