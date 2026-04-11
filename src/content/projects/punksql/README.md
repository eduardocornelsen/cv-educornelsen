## The Problem

SQL learning tools exist at two extremes: dry textbooks that explain theory without practice, and platforms like LeetCode that assume you already know the fundamentals. Neither is built for the way people actually learn today — on their phones, in short sessions, with instant feedback.

I built the tool I wish existed when I was learning SQL.

---

## What I Built

**PunkSQL** is a mobile-first SQL learning platform where every query runs against a real SQLite database in your browser — no server, no backend, no account required. Write SQL on your phone, get instant results, earn XP.

The editor is designed specifically for mobile: swipe anywhere on the screen to move the cursor (no tiny tap targets), collapsible panels for table and column names, a focus mode that collapses all UI chrome to maximize the editor. It works as naturally on a phone as on a laptop.

---

## Learning Path

Eight sequential modules, each unlocking progressively as the previous is completed:

```
Module 1 · first_query    SELECT, FROM, DISTINCT, LIMIT, COUNT
Module 2 · filtering      WHERE, AND/OR, IN, LIKE, BETWEEN
Module 3 · sorting        ORDER BY, ASC/DESC, multi-column, LIMIT
Module 4 · aggregations   COUNT, SUM, AVG, MIN/MAX, GROUP BY, HAVING
Module 5 · joins          INNER JOIN, LEFT JOIN, multi-table, ON
Module 6 · subqueries     Scalar, NOT IN, EXISTS, correlated
Module 7 · window_fn      ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD, PARTITION BY
Module 8 · ctes           WITH, chained CTEs, CASE WHEN, recursive patterns
```

Each module has 10 SQL challenges with real validation against expected output — column order, row count, and values all checked. Plus quiz questions and swipeable flashcards for theory reinforcement.

---

## Gamification

Progress is earned, not gamed. XP is granted only on first solve — no farming. Reaching a new level triggers a full-screen animation with a synthesized fanfare (Tone.js). Ten achievements unlock across the curriculum: from running your first query to solving all 80 challenges.

A daily challenge rotates every day with a +100 XP bonus, creating a reason to return.

---

## Bilingual by Design

Every challenge description, quiz question, flashcard, UI element, and achievement exists in both **English and Brazilian Portuguese**. Toggle with the EN/PT switcher in the top bar. Designed for Brazilian learners entering the data job market — and for anyone who thinks better in their native language.

---

## Key Results

| Metric | Value |
|---|---|
| SQL challenges | 80 |
| Modules | 8 (SELECT → CTEs) |
| Quiz questions | 48 |
| Flashcards | 34 |
| Achievements | 10 |
| Languages | EN / PT-BR |
| Backend required | None |
| SQL engine | SQLite compiled to WebAssembly |
| Infrastructure cost | $0/month |

---

## Stack

`Next.js 14` · `React 18` · `SQLite/WASM (sql.js)` · `Tone.js` · `Google OAuth` · `Browser Storage API` · `Vercel`

The entire app lives in a single self-contained file — intentionally designed to run inside Claude.ai as an artifact, as a Next.js page, or be ported to React Native with minimal changes.
