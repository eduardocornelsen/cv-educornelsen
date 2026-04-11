## The Problem

Music analytics platforms show you what happened — streams by track, plays by region, skips by demographic. They cannot explain *why* one song reaches 100M streams while another with similar production quality and marketing budget stalls at 10K.

Answering that question requires a data analyst. Most music teams don't have one on call.

---

## What I Built

An **AI-powered music analytics platform** that puts a data scientist inside every music professional's browser. Ask a complex analytical question in plain English. The AI writes and executes Pandas code in real time against 160,000+ tracks, then returns a natural language answer with interactive charts.

No SQL. No Python. No data science background required.

---

## The AI Consultant

Powered by **LangChain + Gemini 2.0 Flash**, the AI agent understands complex questions and runs fresh analysis — no pre-computed answers, no canned responses:

> *"What's the correlation between danceability and popularity for 2020s pop hits?"*
> *"Which genres have converged in audio features over the last decade?"*
> *"Find the optimal BPM range for workout playlist songs."*
> *"What audio DNA do all Billboard #1 hits share?"*

Every query executes real Pandas/NumPy code on the full dataset and returns a formatted result within 2 seconds.

![AI Consultant](chatbot.webp)

---

## Interactive Dashboards

17+ visualizations covering 100 years of music evolution (1920–2020):

- Audio feature trends by decade: energy, danceability, valence, acousticness
- Genre clustering and convergence analysis
- Popularity distribution and hit-rate modeling
- Artist longevity and catalog depth analysis

![Dashboard](dashboard.webp)

![Insights](insights.webp)

---

## Architecture

A LangChain agent intercepts natural language queries, generates Pandas and NumPy code via Gemini 2.0, executes it against the loaded dataset, and returns structured results — charts and interpretation in one response.

![Architecture](architecture.png)

---

## Dataset

| Metric | Value |
|---|---|
| Total tracks | 160,000+ |
| Time range | 1920–2020 (100 years) |
| Audio features | 20+ per track (energy, valence, tempo, acousticness, danceability, and more) |
| Genres | 2,900+ |
| Artists | 50,000+ |

Source: Spotify Dataset 1921–2020 via Kaggle.

---

## Key Results

| Metric | Value |
|---|---|
| AI query response time | < 2 seconds |
| Dashboard visualizations | 17+ interactive charts |
| Dataset size | 160,000+ tracks |
| Concurrent users tested | 50+ |

---

## Stack

`Python` · `LangChain` · `Gemini 2.0 Flash` · `Streamlit` · `Plotly` · `Pandas` · `NumPy` · `SciPy` · `Docker`

Built as part of the **TripleTen Data Science & Analytics Residency** (700h+), delivering end-to-end ML and AI projects on real business datasets.
