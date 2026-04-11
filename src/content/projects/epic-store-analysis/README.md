## The Problem

The conventional wisdom in game development: better graphics equals higher ratings. Invest in a 4K AAA title, and players will reward you with 90+ review scores.

**The data proves the opposite.**

---

## The Hardware Wall Paradox

Using **Random Forest Regression (R² = 0.392)** on 80MB of Epic Games Store data — covering games, hardware specs, professional reviews, and social ecosystems — I found a **negative correlation of −0.133** between hardware requirements and player satisfaction.

Games requiring 16GB+ RAM score *lower* than games that run on 4GB. The "Success Ceiling" drops as specs rise.

![The Hardware Wall](hardware-wall.webp)

Why? Players who invest in expensive rigs have near-zero tolerance for unoptimized code. High specs signal high expectations — and when a game doesn't deliver on optimization, the review penalty is disproportionate and immediate.

When we rank every driver of player satisfaction, hardware friction acts as an anchor pulling scores down, while review volume acts as fuel lifting them up.

![Quality Drivers](game-ratings-x-ray.webp)

SHAP analysis makes the penalty visible: the heavier the hardware requirement, the harder the drag on ratings.

![Rating Anatomy (SHAP)](rating-anatomy.webp)

> *Technical specifications, price, and genre explain only 40% of a game's success. The remaining 60% is "Intangible UX" — narrative resonance, art direction, and polish.*

---

## Market Personas (K-Means Clustering)

K-Means clustering revealed four behavioral product personas — not genre labels, but segments defined by how players respond to price, specs, and quality.

![Cluster PCA](pca-result.webp)

| Persona | Avg Price | Avg Rating | Insight |
|---|---|---|---|
| **Titans** (High-Fidelity) | High | 54.5 | Technical excellence is the entry ticket |
| **⚠️ Premium Indies** | $49.90 | 46.3 | Highest cost, lowest satisfaction — UX Debt |
| **Accessible Backbone** | Standard | Stable | Market stability, low friction |
| **Budget Champions** | Low | High | Hidden performers — spec-light, satisfaction-heavy |

The **Premium Indies** cluster is the critical friction point: the players paying the most are the least satisfied. Price signals quality. When the experience doesn't match the price tag, the backlash is swift.

---

## The Connectivity Premium

More social channels does not mean more engagement. The data is unambiguous:

![Social Ecosystem](social_ecosystem.webp)

- Games managing **5+ social platforms**: avg rating **72.5**
- Games focused on exactly **one channel (Discord)**: avg rating **77.5**

A **+3.2 rating lift** for depth over breadth. The "Be Everywhere" strategy is a distraction trap — community focus is the actual lever.

---

## Narrative DNA (NLP: LDA Topic Modeling)

Beyond metadata, five psychological pillars emerged from topic modeling of game descriptions — the hidden vocabulary players respond to emotionally.

![Narrative Pillars](narratives.webp)

![Vocabulary Clusters](vocabulary.webp)

1. **World Builders** — "Create, Build, City" — *Agency Fantasy*
2. **Combat & Survival** — "Dead, Fight, Survive" — *Adrenaline Fantasy*
3. **Discovery** — "Mystery, Space"
4. **Action Sports** — "Race, Speed"
5. **Narrative Epics** — "Story, Soul, Life"

These DNA markers power a recommendation engine that surfaces games by *vibe* — not just genre, price, or RAM requirements.

---

## Seasonality Strategy

For the Premium Indies cluster — high price, low visibility — ratings peak at **53+** during **May–June**, with **40% less competition** than Q4.

![Seasonality](seasonality_check.webp)

Shifting marketing windows for expensive titles to this period gives them the space and visibility needed to justify their cost and earn the review scores they deserve.

---

## Outcome

Delivered a live Streamlit dashboard, a data-backed **2026 Strategic Roadmap**, and a UXR executive presentation — earning a **final-round candidacy for the Data Analyst role at Epic Games**.

---

## Key Findings

| Finding | Evidence |
|---|---|
| Hardware vs. satisfaction | −0.133 correlation (negative) |
| Random Forest R² | 0.392 |
| Intangible UX gap | 60% of satisfaction unexplained by metadata |
| Premium Indie price vs. rating | $49.90 avg price · 46.3 avg rating |
| Discord focus lift | +3.2 rating points vs. 5+ platform strategy |
| May–June quality peak | 53+ ratings · 40% less competition than Q4 |

---

## Stack

`Python` · `Scikit-learn` · `Random Forest` · `K-Means` · `LDA/TF-IDF` · `SHAP Values` · `Plotly` · `Seaborn` · `Streamlit` · `Pandas` · `NumPy`
