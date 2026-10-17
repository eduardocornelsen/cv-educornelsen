import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { trackEvent } from '../utils/analytics';
import { Chatbot } from './chatbot';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import governedAnalystReadme from '../content/projects/governed-analyst/README.md?raw';
import fullFunnelReadme from '../content/projects/full-funnel-ai-analytics/README.md?raw';
import punksqlReadme from '../content/projects/punksql/README.md?raw';
import leadEngineReadme from '../content/projects/lead_engine/README.md?raw';
import epicReadme from '../content/projects/epic-store-analysis/README.md?raw';
import portfolioInfraReadme from '../content/projects/portfolio-infra/README.md?raw';
import {
    ArrowRight, LineChart as BarChart3, Bot, Zap, BookOpen, Database,
    X, Menu, Mail, Linkedin, Sparkles, ChevronLeft, ChevronRight, Terminal, Download
} from 'lucide-react';
const DataVizShowcase = lazy(() => import('./DataVizShowcase'));
const DashboardShowcase = lazy(() => import('./DashboardShowcase'));

// Skill Logos
import pythonLogo from '../assets/logos/python.svg';
import sqlLogo from '../assets/logos/postgresql.svg';
import dbtLogo from '../assets/logos/dbt.webp';
import polarsLogo from '../assets/logos/polars.svg';
import pandasLogo from '../assets/logos/pandas.svg';
import gitLogo from '../assets/logos/git.svg';
import bashLogo from '../assets/logos/gnubash.svg';
import bigqueryLogo from '../assets/logos/googlebigquery.svg';
import databricksLogo from '../assets/logos/databricks.svg';
import snowflakeLogo from '../assets/logos/snowflake.svg';
import duckdbLogo from '../assets/logos/duckdb.svg';
import sparkLogo from '../assets/logos/apachespark.svg';
import gcpLogo from '../assets/logos/googlecloud.svg';
import langchainLogo from '../assets/logos/langchain.svg';
import langgraphLogo from '../assets/logos/langgraph.svg';
import mcpLogo from '../assets/logos/modelcontextprotocol.svg';
import mlflowLogo from '../assets/logos/mlflow.svg';
import fastapiLogo from '../assets/logos/fastapi.svg';
import geminiLogo from '../assets/logos/googlegemini.svg';
import claudeLogo from '../assets/logos/claude.svg';
import n8nLogo from '../assets/logos/n8n.svg';
import notebooklmLogo from '../assets/logos/notebooklm.svg';
import lookerLogo from '../assets/logos/looker.svg';
import tableauLogo from '../assets/logos/tableau.webp';
import pbiLogo from '../assets/logos/powerbi.png';
import excelLogo from '../assets/logos/ms-excel.png';
import sheetsLogo from '../assets/logos/googlesheets.svg';
import streamlitLogo from '../assets/logos/streamlit.svg';
import reactLogo from '../assets/logos/react.svg';
import nextjsLogo from '../assets/logos/nextdotjs.svg';
import d3Logo from '../assets/logos/d3.svg';
import tailwindLogo from '../assets/logos/tailwindcss.svg';
import sqliteLogo from '../assets/logos/sqlite.svg';
import viteLogo from '../assets/logos/vite.svg';
import obsidianLogo from '../assets/logos/obsidian.svg';
import tailscaleLogo from '../assets/logos/tailscale.svg';
import couchdbLogo from '../assets/logos/apachecouchdb.svg';
import plotlyLogo from '../assets/logos/plotly.svg';
import scipyLogo from '../assets/logos/scipy.svg';
import scikitlearnLogo from '../assets/logos/scikitlearn.svg';
import vercelLogo from '../assets/logos/vercel.svg';
import typescriptLogo from '../assets/logos/typescript.svg';
import githubActionsLogo from '../assets/logos/githubactions.svg';
import antigravityLogo from '../assets/logos/antigravity.png';
import vscodeLogo from '../assets/logos/vscode.webp';
import dockerLogo from '../assets/logos/docker.svg';
import supabaseLogo from '../assets/logos/supabase.svg';
import cloudrunLogo from '../assets/logos/cloudrun.png';
import langfuseLogo from '../assets/logos/langfuse.svg';
import insperLogo from '../assets/logos/insper.svg';
import aarhusLogo from '../assets/logos/aarhus.png';
import mitLogo from '../assets/logos/mit.svg';
import sixSigmaLogo from '../assets/logos/lean-six-sigma.svg';
import downloadIcon from '../assets/logos/download.svg';
import omiePng from '../assets/logos/omie.png';
import omieSvg from '../assets/logos/omie.svg';
import shopifyLogo from '../assets/logos/shopify.svg';
import nuvemshopLogo from '../assets/logos/nuvemshop.svg';
import woocommerceLogo from '../assets/logos/woocommerce.svg';
import mercadolivreLogo from '../assets/logos/mercadolivre.svg';
import facebookmarketLogo from '../assets/logos/facebookmarketplace.svg';
import olxLogo from '../assets/logos/olx.svg';
import webmotorsLogo from '../assets/logos/webmotors.svg';
import blingLogo from '../assets/logos/bling.svg';
import tinyLogo from '../assets/logos/tiny.svg';
import ga4Logo from '../assets/logos/ga4.svg';
import gtmLogo from '../assets/logos/gtm.svg';
import googleAdsLogo from '../assets/logos/googleads.svg';
import metaLogo from '../assets/logos/meta.svg';
import epicGamesLogo from '../assets/logos/epicgames.svg';

// Navigate sections
const NAV_SECTIONS = ['experience', 'projects', 'skills', 'viz', 'about'] as const;

function useBehaviorTracking() {
    const [active, setActive] = useState('');
    const scrollMilestones = useRef(new Set<number>());
    const activeRef = useRef('');

    useEffect(() => {
        // 1. Section Detection + Scroll Depth Tracking
        const handleScroll = () => {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';
            const percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;

            [25, 50, 75].forEach(milestone => {
                if (percent >= milestone && !scrollMilestones.current.has(milestone)) {
                    scrollMilestones.current.add(milestone);
                    trackEvent('Behavior', 'Scroll Depth', `${milestone}%`, { scroll_depth_value: `${milestone}%` });
                }
            });

            // Find the active section: pick the section whose top is closest to
            // 30% down the viewport (works for both large and small sections).
            const target = window.innerHeight * 0.3;
            let bestId = '';
            let bestDist = Infinity;
            NAV_SECTIONS.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                // Only consider sections currently in view
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const dist = Math.abs(rect.top - target);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestId = id;
                    }
                }
            });

            if (bestId && bestId !== activeRef.current) {
                activeRef.current = bestId;
                setActive(bestId);
                trackEvent('Navigation', 'View Section', bestId, { section_id: bestId });
            }
        };

        // 2. Time on Page Milestones
        const startTime = Date.now();
        const timeMilestones = new Set<number>();
        const timerInterval = setInterval(() => {
            const elapsedSecs = Math.floor((Date.now() - startTime) / 1000);
            [30, 60, 120].forEach(milestone => {
                if (elapsedSecs >= milestone && !timeMilestones.has(milestone)) {
                    timeMilestones.add(milestone);
                    trackEvent('Behavior', 'Time on Page', `${milestone}s`, { time_milestone_value: `${milestone}s` });
                }
            });
        }, 1000);

        // Run once on mount to set initial active section
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(timerInterval);
        };
    }, []);

    return active;
}

const TECH_LOGOS: Record<string, string> = {
    // Core
    "Python": pythonLogo,
    "SQL": sqlLogo,
    "PostgreSQL": sqlLogo,
    "dbt": dbtLogo,
    "dbt Core": dbtLogo,
    "Polars": polarsLogo,
    "Pandas": pandasLogo,
    "Git": gitLogo,
    "Bash": bashLogo,
    "n8n": n8nLogo,
    "FastAPI": fastapiLogo,
    
    // Cloud & Infrastructure
    "BigQuery": bigqueryLogo,
    "Databricks": databricksLogo,
    "Snowflake": snowflakeLogo,
    "DuckDB": duckdbLogo,
    "PySpark": sparkLogo,
    "GCP": gcpLogo,
    "SQLite": sqliteLogo,
    "SQLite/WASM": sqliteLogo,

    // AI & ML
    "LangChain": langchainLogo,
    "LangGraph": langgraphLogo,
    "MCP": mcpLogo,
    "MLFlow": mlflowLogo,
    "NotebookLM": notebooklmLogo,
    "Gemini API": geminiLogo,
    "Gemini 3 Flash": geminiLogo,
    "Gemini Flash": geminiLogo,
    "Gemini CLI": geminiLogo,
    "Claude API": claudeLogo,
    "Claude": claudeLogo,
    "Claude Code": claudeLogo,
    "Google Antigravity": antigravityLogo,
    "VS Code": vscodeLogo,

    // BI & Reporting
    "Looker Studio": lookerLogo,
    "Tableau": tableauLogo,
    "Power BI": pbiLogo,
    "Excel": excelLogo,
    "Google Sheets": sheetsLogo,
    "Streamlit": streamlitLogo,

    // Frontend & Viz
    "React": reactLogo,
    "Next.js": nextjsLogo,
    "D3.js": d3Logo,
    "TailwindCSS": tailwindLogo,
    "Vite": viteLogo,
    "TypeScript": typescriptLogo,
    "Supabase": supabaseLogo,
    "Obsidian": obsidianLogo,
    "Tailscale": tailscaleLogo,
    "CouchDB": couchdbLogo,
    "Vercel": vercelLogo,
    "Docker": dockerLogo,
    "GitHub Actions": githubActionsLogo,
    "Google Cloud Run": cloudrunLogo,
    "LangFuse": langfuseLogo,
    "Langfuse": langfuseLogo,
    "Gemini": geminiLogo,
    "Plotly": plotlyLogo,
    "SciPy": scipyLogo,
    "Scikit-Learn": scikitlearnLogo,
    "Omie": omieSvg,
    "Excel/Google Sheets": excelLogo,
    "Excel / Google Sheets": excelLogo,
    "Python Scripts": pythonLogo,
    "GA4": ga4Logo,
    "GTM": gtmLogo,
    "GA4 / GTM": ga4Logo,
    "Google Ads": googleAdsLogo,
    "Meta Ads": metaLogo,
    "Google Ads / Meta Ads": googleAdsLogo,
    "Facebook Marketplace": facebookmarketLogo,
    "Semantic Layer": dbtLogo,
    "Shopify": shopifyLogo,
    "NuvemShop": nuvemshopLogo,
    "WooCommerce": woocommerceLogo,
    "Mercado Livre": mercadolivreLogo,
    "OLX": olxLogo,
    "WebMotors": webmotorsLogo,
    "Bling": blingLogo,
    "Tiny": tinyLogo,
    // Combo aliases for expanded-state rows
    "Pandas / Polars": pandasLogo,
    "React / Next.js": reactLogo,
    "D3.js / Plotly / Recharts": d3Logo,
    "GCP + Cloudflare": gcpLogo,
    "API Integration": pythonLogo,
};

const SKILL_ITEMS = [
    {
        icon: <Database className="w-5 h-5" />,
        title: "Data Engineering & Pipelines",
        desc: "Designing robust ETL/ELT workflows and scalable data models.",
        tags: ["PostgreSQL", "Python", "dbt Core", "Semantic Layer", "Pandas", "DuckDB", "Git", "GitHub Actions", "Docker", "Bash"],
        contextItems: [
            { tool: "PostgreSQL",      context: "Row-level security · read-only analyst role · coffee e-commerce data layer" },
            { tool: "Python",          context: "Core language · ETL, automation, modeling" },
            { tool: "dbt Core",         context: "Full-Funnel (30 models) · coffee e-commerce data layer · Postgres & DuckDB" },
            { tool: "Semantic Layer",  context: "dbt MetricFlow · metric governance" },
            { tool: "Pandas / Polars", context: "Data transformation & ELT processing" },
            { tool: "DuckDB",          context: "Local execution layer · Full-Funnel analytics pipeline" },
            { tool: "Git",             context: "Version control · all projects" },
            { tool: "GitHub Actions",  context: "CI/CD · portfolio & pipeline repos" },
            { tool: "Docker",          context: "Containerized pipeline environments" },
            { tool: "Bash",            context: "Pipeline automation & scripting" },
        ],
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        icon: <Terminal className="w-5 h-5" />,
        title: "Data Platforms & Warehousing",
        desc: "Cloud warehouses, lakehouses, and embedded engines for analytics at every scale.",
        tags: ["BigQuery", "DuckDB", "Databricks", "PySpark", "Snowflake", "GCP"],
        contextItems: [
            { tool: "BigQuery",   context: "Primary warehouse · Torus client stack" },
            { tool: "DuckDB",     context: "Local analytics engine · embedded warehouse · Full-Funnel AI Platform" },
            { tool: "Databricks", context: "PySpark notebooks · TripleTen lakehouse · 2× Academy accreditations" },
            { tool: "PySpark",    context: "Feature engineering · Databricks environment" },
            { tool: "GCP",        context: "Cloud Run, Storage · supporting BigQuery workflows" },
            { tool: "Snowflake",  context: "Architecture & design patterns · studied" },
        ],
        gradient: "from-cyan-500 to-sky-500",
    },
    {
        icon: <Bot className="w-5 h-5" />,
        title: "AI Agents & Infrastructure",
        desc: "Building LLM-powered agents and natural language data interfaces.",
        tags: ["Claude Code", "Gemini Flash", "LangChain", "MCP", "FastAPI", "Scikit-Learn", "Langfuse"],
        contextItems: [
            { tool: "Claude Code",        context: "Agentic coding · CLI, Desktop & Mobile" },
            { tool: "Gemini Flash",       context: "Portfolio chatbot · TripleTen agents" },
            { tool: "LangChain",          context: "Chat with Data agents · TripleTen" },
            { tool: "MCP",                context: "6 servers · Full-Funnel AI Platform" },
            { tool: "FastAPI",            context: "Model-serving endpoint · Full-Funnel AI Platform" },
            { tool: "Scikit-Learn",       context: "Random Forest, K-Means · Epic Games analysis" },
            { tool: "Langfuse",           context: "LLM observability · portfolio chatbot" },
        ],
        gradient: "from-violet-500 to-purple-500",
    },
    {
        icon: <Zap className="w-5 h-5" />,
        title: "Automation & Revenue Ops",
        desc: "Eliminating manual work through intelligent workflow orchestration.",
        tags: ["n8n", "Python Scripts", "API Integration"],
        contextItems: [
            { tool: "n8n",            context: "SDR automation workflows · Torus clients" },
            { tool: "Python Scripts", context: "ETL automation · reporting pipelines" },
            { tool: "API Integration",context: "Multi-platform data connectors" },
        ],
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: <BarChart3 className="w-5 h-5" />,
        title: "BI, Analytics & Marketing",
        desc: "Decision-ready dashboards and marketing attribution analytics.",
        tags: ["Looker Studio", "Tableau", "Excel / Google Sheets", "Streamlit", "GA4 / GTM", "Google Ads / Meta Ads"],
        contextItems: [
            { tool: "Looker Studio",        context: "20+ dashboards · 4 client verticals" },
            { tool: "Tableau",              context: "TripleTen projects · Mandalah/Gerdau · 4,000+ employees · 7 countries" },
            { tool: "Excel / Google Sheets",context: "Financial models · P&L reporting" },
            { tool: "Streamlit",            context: "Interactive data apps" },
            { tool: "GA4 / GTM",            context: "Tag management · Torus client stack" },
            { tool: "Google Ads / Meta Ads",context: "R$100K+ media · ~20% CPA reduction" },
        ],
        gradient: "from-rose-500 to-pink-500",
    },
    {
        icon: <Sparkles className="w-5 h-5" />,
        title: "Custom Viz & Frontend",
        desc: "Building interactive data applications and high-performance frontends.",
        tags: ["React / Next.js", "TypeScript", "TailwindCSS", "SQLite/WASM", "D3.js / Plotly / Recharts", "Vite"],
        contextItems: [
            { tool: "React / Next.js",         context: "PunkSQL app · portfolio site" },
            { tool: "TypeScript",              context: "Type-safe frontend development" },
            { tool: "TailwindCSS",             context: "Portfolio site + Torus client dashboards" },
            { tool: "SQLite/WASM",             context: "In-browser SQL engine · PunkSQL" },
            { tool: "D3.js / Plotly / Recharts",context: "Custom chart components" },
            { tool: "Vite",                    context: "Portfolio site build tool" },
            { tool: "GCP + Cloudflare",        context: "Portfolio site hosting & CDN" },
            { tool: "Vercel",                  context: "PunkSQL deployment" },
        ],
        gradient: "from-indigo-500 to-blue-500",
    },
];

export type MediaItem = { type: 'image' | 'video' | 'html' | 'pdf'; src: string; contain?: boolean; };

// Only adds the <video> element to the DOM once the carousel scrolls into view,
// preventing both MP4 assets (~10 MB combined) from downloading on initial page load.
function LazyVideo({ src, contain }: { src: string; contain?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true);
                    obs.disconnect();
                }
            },
            { rootMargin: '400px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className={`w-full h-full ${contain ? 'bg-surface-2' : 'bg-surface-2'}`}>
            {active && (
                <video
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`w-full h-full ${contain ? 'object-contain' : 'object-cover'}`}
                />
            )}
        </div>
    );
}

export type ProjectData = {
    title: string;
    outcome: string;
    desc: string;
    media: MediaItem[];
    // Static 16:9 image for the project grid; media (videos, iframes) stays in the modal.
    cover: string;
    coverContain?: boolean;
    gradient: string;
    tags: string[];
    // Absent when the code is private (client work).
    github?: string;
    liveUrl?: string;
    presentationUrl?: string;
    readme?: string;
    images?: Record<string, string>;
};

const PROJECTS: ProjectData[] = [
    {
        title: "Governed AI Analyst for a Live E-commerce",
        cover: new URL('../assets/projects/governed-analyst/cover.svg', import.meta.url).href,
        outcome: "Live on a real business · Client work",
        desc: "Owners of a specialty-coffee e-commerce ask questions in plain language and get contribution margin, P&L and channel numbers that come straight from tested models. The pipeline computes, the AI only reads: read-only SQL with an allowlist, row-level security, a semantic schema that fails CI on drift, and a checker that rejects any number not in the query results.",
        media: [
            { type: 'image', src: new URL('../assets/projects/governed-analyst/cover.svg', import.meta.url).href, contain: true },
        ],
        gradient: "from-emerald-500 to-teal-500",
        tags: ["dbt", "PostgreSQL", "Row-level security", "Claude API"],
        readme: governedAnalystReadme,
    },
    {
        title: "Full-Funnel AI Analytics Platform",
        cover: new URL('../assets/projects/full-funnel-ai-analytics/marketing-dashboard.webp', import.meta.url).href,
        outcome: "Zero Metric Drift · 4 Attribution Models",
        desc: "Ask an AI for ROAS and you get a different number every time. I built a dbt pipeline (real Olist e-commerce orders + synthetic Google/Meta/GA4/CRM data) where every metric is defined once, pre-computed into a tested golden layer, and read — never recomputed — by AI clients over MCP and by dashboards. CI fails if any number drifts or goes stale.",
        media: [
            { type: 'video', src: new URL('../assets/projects/full-funnel-ai-analytics/open-query.mp4', import.meta.url).href, contain: true },
            { type: 'image', src: new URL('../assets/projects/full-funnel-ai-analytics/full_funnel_architecture_flow.webp', import.meta.url).href },
            { type: 'html', src: new URL('../assets/projects/full-funnel-ai-analytics/full_funnel_marketing_dashboard.html', import.meta.url).href },
            { type: 'html', src: new URL('../assets/projects/full-funnel-ai-analytics/attribution_dashboard.html', import.meta.url).href },
            { type: 'html', src: new URL('../assets/projects/full-funnel-ai-analytics/campaign_performance_dashboard.html', import.meta.url).href },
            { type: 'html', src: new URL('../assets/projects/full-funnel-ai-analytics/pipeline_dashboard.html', import.meta.url).href },
            { type: 'html', src: new URL('../assets/projects/full-funnel-ai-analytics/traffic_ga4_dashboard.html', import.meta.url).href },
            { type: 'pdf', src: new URL('../assets/projects/full-funnel-ai-analytics/Governed_AI_Marketing_Analytics_compressed.pdf', import.meta.url).href },
            { type: 'image', src: new URL('../assets/projects/full-funnel-ai-analytics/marketing-dashboard.webp', import.meta.url).href },
        ],
        gradient: "from-emerald-500 to-cyan-500",
        tags: ["dbt", "DuckDB", "MCP", "Semantic Layer"],
        github: "https://github.com/eduardocornelsen/full-funnel-ai-analytics",
        presentationUrl: "https://drive.google.com/file/d/1GfNopUxsnO8gr29wYX1d5ldCjfeyh-fJ/view?usp=drive_link",
        readme: fullFunnelReadme,
        images: {
            'architecture.webp': new URL('../assets/projects/full-funnel-ai-analytics/full_funnel_architecture_flow.webp', import.meta.url).href,
            'open-query.png': new URL('../assets/projects/full-funnel-ai-analytics/open-query.png', import.meta.url).href,
            'dashboard.webp': new URL('../assets/projects/full-funnel-ai-analytics/marketing-dashboard.webp', import.meta.url).href,
        },
    },
    {
        title: "Product & UX Analytics (Epic Games)",
        cover: new URL('../assets/projects/epic-store-analysis/cover-epic.webp', import.meta.url).href,
        outcome: "Final-Round Candidate · Strategic Audit",
        desc: "What actually drives player satisfaction on the Epic Games Store? Using Random Forest (R²=0.392), K-Means clustering, and NLP (LDA), I uncovered the 'Hardware Wall Paradox' — proving high RAM requirements actively degrades satisfaction scores (-0.133 correlation). Delivered a live Streamlit dashboard and a 2026 Strategic Roadmap.",
        media: [
            { type: 'image', src: new URL('../assets/projects/epic-store-analysis/cover-epic.webp', import.meta.url).href },
        ],
        gradient: "from-amber-500 to-orange-500",
        tags: ["Random Forest", "NLP (LDA)", "SHAP Values", "Streamlit"],
        github: "https://github.com/eduardocornelsen/epic-store-analysis/",
        liveUrl: "https://epic-store-analysis.streamlit.app/",
        presentationUrl: "https://drive.google.com/file/d/1-bqd7O1e-ZP4aW_Bcv4mSAc0QmXR0cmB/view?usp=drive_link",
        readme: epicReadme,
        images: {
            'pca-result.webp':        new URL('../assets/projects/epic-store-analysis/pca-result.webp', import.meta.url).href,
            'hardware-wall.webp':     new URL('../assets/projects/epic-store-analysis/hardware-wall.webp', import.meta.url).href,
            'game-ratings-x-ray.webp': new URL('../assets/projects/epic-store-analysis/game-ratings-x-ray.webp', import.meta.url).href,
            'rating-anatomy.webp':    new URL('../assets/projects/epic-store-analysis/rating-anatomy.webp', import.meta.url).href,
            'social_ecosystem.webp':  new URL('../assets/projects/epic-store-analysis/social_ecosystem.webp', import.meta.url).href,
            'narratives.webp':        new URL('../assets/projects/epic-store-analysis/narratives.webp', import.meta.url).href,
            'vocabulary.webp':        new URL('../assets/projects/epic-store-analysis/vocabulary.webp', import.meta.url).href,
            'seasonality_check.webp': new URL('../assets/projects/epic-store-analysis/seasonality_check.webp', import.meta.url).href,
        },
    },
    {
        title: "RevOps Lead Engine",
        cover: new URL('../assets/projects/lead_engine/cover-small.jpg', import.meta.url).href,
        outcome: "Autonomous B2B Pipeline",
        desc: "SDR teams spend 60% of their time on tasks that shouldn't require humans. I built an autonomous B2B pipeline with AI Copilot for predictive revenue modeling, explainable AI (XAI) scoring, and NDR analytics — automating enrichment, routing, and lead scoring end-to-end.",
        media: [
            { type: 'image', src: new URL('../assets/projects/lead_engine/cover-small.jpg', import.meta.url).href },
        ],
        gradient: "from-violet-500 to-purple-500",
        tags: ["XAI", "LangChain", "SDR Automation", "Python"],
        github: "https://github.com/eduardocornelsen/revops_lead_engine/",
        liveUrl: "https://revops-lead-engine.streamlit.app/",
        readme: leadEngineReadme,
        images: {
            'cover.jpg': new URL('../assets/projects/lead_engine/cover-small.jpg', import.meta.url).href,
        },
    },
    {
        title: "PunkSQL",
        cover: new URL('../assets/projects/punksql/cover.webp', import.meta.url).href,
        outcome: "Bilingual · 80 Challenges · Mobile-First",
        desc: "SQL shouldn't require a textbook. I built a mobile-first learning platform with in-browser SQL execution (SQLite/WASM), Google OAuth, XP/levels/achievements — 80 challenges across 8 modules, deployed on Vercel with Next.js.",
        media: [
            { type: 'video', src: new URL('../assets/projects/punksql/demo-iphone.mp4', import.meta.url).href },
        ],
        gradient: "from-rose-500 to-pink-500",
        tags: ["Next.js", "TypeScript", "SQLite/WASM", "OAuth", "Vercel"],
        github: "https://github.com/eduardocornelsen/",
        liveUrl: "https://punksql.vercel.app/",
        readme: punksqlReadme,
        images: {},
    },
    {
        title: "Portfolio Infrastructure & AI Chatbot",
        cover: new URL('../assets/projects/portfolio-infra/lang-fuse.webp', import.meta.url).href,
        outcome: "Cloud Run · 4-Layer Security · LLMOps",
        desc: "Built the production infrastructure behind this site: a streaming AI chatbot (Gemini + SSE), containerized via multi-stage Docker, deployed via GitHub Actions to Google Cloud Run with LangFuse tracing every conversation for cost, latency, and jailbreak detection. Includes Vitest unit tests, Playwright E2E tests, daily automated synthetic monitoring via GitHub Actions cron, and GA4 test traffic filtering to keep analytics clean. Zero-cost at idle, zero-touch deploys.",
        media: [
            { type: 'image', src: new URL('../assets/projects/portfolio-infra/lp.webp', import.meta.url).href },
            { type: 'image', src: new URL('../assets/projects/portfolio-infra/lang-fuse.webp', import.meta.url).href },
        ],
        gradient: "from-slate-500 to-zinc-600",
        tags: ["Google Cloud Run", "Docker", "GitHub Actions", "Gemini", "LangFuse", "React", "TypeScript", "Vitest", "Playwright"],
        github: "https://github.com/eduardocornelsen/cv-educornelsen",
        liveUrl: "https://eduardocornelsen.com",
        readme: portfolioInfraReadme,
        images: {},
    },
];

const EXPERIENCES: { role: string; badge?: string; company: string; period: string; logo: string; intro?: string; bullets: string[] }[] = [
    {
        role: "Data Analyst & Analytics Engineer (Independent)",
        company: "Torus Analytics · Remote",
        period: "Jul 2021 - Present",
        logo: new URL('../assets/logos/torus-logo.svg', import.meta.url).href,
        intro: "Independent analytics practice serving SMBs across e-commerce, retail, automotive, agribusiness, and hospitality.",
        bullets: [
            "Built the data layer for a live specialty-coffee e-commerce and subscription business: Postgres with row-level security, 18 dbt models generated from one semantic schema (a CI test fails on drift), contribution margin by sales channel, monthly P&L, moving-average cost of goods.",
            "Shipped an AI analyst that answers business questions in plain language over SQL. The pipeline computes, the model only reads: read-only database role, SQL allowlist, per-tenant RLS, query timeouts, and a checker that verifies every number the model writes against the query results.",
            "Built a multi-source ingestion + dbt pipeline (ERP API and e-commerce database) with explicit cross-source deduplication, integer-cents money handling, and golden-metric regression checks.",
            "Built 20+ Looker Studio dashboards integrating 10+ data sources (CRMs, GA4/GTM, Google/Meta Ads, ERPs, POS, bank feeds) — adopted as the primary operating view across 4 client verticals.",
            "Developed 10+ financial reporting systems (cash flow, P&L, margin). Automated bank reconciliation reduced daily manual work from ~2h to ~10min, enabling near-real-time tracking.",
            "Managed R$100K+ in annual media budgets across Google, Meta, and 10+ marketplaces — achieving ~20% average CPA reduction through channel mix optimization.",
            "Designed and maintained ELT workflows unifying data across 10+ platforms (Shopify, Mercado Livre, OLX, WooCommerce, NuvemShop) and 3 ERPs (Omie, Bling, Tiny) into consolidated analytics layers.",
            "Automated recurring reporting with Python scripts, API integrations, and n8n — eliminating 50+ hours/month of manual data handling."
        ]
    },
    {
        role: "Senior Sales Executive · Consultative SaaS ERP Sales",
        company: "Omie · São Paulo, Brazil · Hybrid",
        period: "Mar 2019 - May 2021",
        logo: omiePng,
        intro: "Analytical and commercial leadership at Brazil's leading cloud ERP & Fintech platform (raised $160M Series D in 2025 at $700M+ valuation). Promoted Junior → Senior in 10 months. One of ~15 retained from a ~90-person commercial team during post-COVID restructuring. Contributed to 200+ ERP adoptions across SMB and enterprise segments.",
        bullets: [
            "Conducted 1,000+ deep-dive diagnostic sessions with SMB founders and executives using SPIN Selling methodology — mapping operational inefficiencies across CRM, Sales, Inventory, Production, Purchasing, Finance (P&L, cash flow, bank reconciliation), and E-commerce/POS workflows. Enterprise accounts included Belgo Cercas/ArcelorMittal and Caffeine Army/Supercoffee.",
            "Built personal Looker Studio dashboards and Excel scoring models for pipeline management — monitoring stage conversion, velocity, and forecast accuracy using Predictable Revenue and Inside Sales frameworks.",
            "Partnered with Product, Customer Success, and OmieStore teams to translate account insights into strategic feedback supporting platform evolution and retention.",
            "Managed full-cycle B2B sales from prospecting through close — averaging ~10 new client acquisitions per month across ~2 years, serving SMB through enterprise segments."
        ]
    },
    {
        role: "Business & Data Analyst",
        company: "Mandalah Conscious Innovation Consultancy · São Paulo, Brazil · On-site",
        period: "Apr 2018 - Oct 2018",
        logo: new URL('../assets/logos/mandalah.webp', import.meta.url).href,
        bullets: [
            "Implemented a global research + BI stack (Qualtrics + Tableau) for an enterprise culture program at Gerdau, impacting 4,000+ employees across 7 countries. Delivered C-suite insight reports for executive decision support.",
            "Supported research and market intelligence for Retail/Real Estate (Multiplan), Humanitarian sector (UNHCR/UN) and Telecom.",
            "Developed scenario analysis and market repositioning for a pioneer Web3/crypto-asset platform."
        ]
    },
    {
        role: "Business Strategy Consultant (REP Insper Program)",
        company: "B.blend (Whirlpool & Ambev)",
        period: "Feb 2017 - Jul 2017",
        logo: new URL('../assets/logos/bblend.webp', import.meta.url).href,
        bullets: [
            "Applied PDCA, Ishikawa root-cause analysis, and structured problem-solving frameworks to diagnose conversion funnel friction and prioritize high-impact fixes.",
            "Awarded Falconi Lean Six Sigma Green Belt for presenting ROI-oriented, data-driven recommendations to the B.blend executive board."
        ]
    },
    {
        role: "Growth Analyst",
        company: "Estudar com Você",
        period: "Jun 2016 - Aug 2016",
        logo: new URL('../assets/logos/estudar-com-voce.webp', import.meta.url).href,
        bullets: [
            "Executed growth traction strategies and built incentive/compensation modeling using student satisfaction data to align teacher payouts with content quality."
        ]
    }
];

const LOGOS_IMPACTED = [
    { name: 'Gerdau', src: new URL('../assets/logos/gerdau.png', import.meta.url).href, size: 'h-12 md:h-14 max-w-[150px] md:max-w-[180px]', href: 'http://gerdau.com/' },
    { name: 'ACNUR', src: new URL('../assets/logos/acnur.svg', import.meta.url).href, size: 'h-12 md:h-14 max-w-[150px] md:max-w-[180px]', href: 'https://www.acnur.org/' },
    { name: 'SuperCoffee', src: new URL('../assets/logos/suppercoffee.webp', import.meta.url).href, size: 'h-16 md:h-20 max-w-[200px] md:max-w-[240px]', href: 'https://www.caffeinearmy.com.br/' },
    { name: 'Belgo Cercas', src: new URL('../assets/logos/belgo-cercas.webp', import.meta.url).href, size: 'h-12 md:h-14 max-w-[150px] md:max-w-[180px]', href: 'https://www.belgocercas.com.br/' },
    { name: 'Multiplan', src: new URL('../assets/logos/multiplan.webp', import.meta.url).href, size: 'h-12 md:h-14 max-w-[150px] md:max-w-[180px]', href: 'http://multiplan.com.br/' },
];

const MediaCarousel = ({ media, containerClasses }: { media: MediaItem[], containerClasses: string }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const touchStartX = useRef<number>(0);

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
            if (dx < 0) setCurrentSlide((prev) => (prev === media.length - 1 ? 0 : prev + 1));
            else setCurrentSlide((prev) => (prev === 0 ? media.length - 1 : prev - 1));
        }
    };

    if (media.length === 0) return null;

    return (
        <div
            className={`relative overflow-hidden group/carousel ${containerClasses}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {media.map((item, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    {item.type === 'video' ? (
                        <LazyVideo src={item.src} contain={item.contain} />
                    ) : item.type === 'html' || item.type === 'pdf' ? (
                        <iframe 
                            src={item.src} 
                            className="w-full h-full border-0 bg-white" 
                            title={`Slide ${index + 1}`}
                            loading="lazy"
                        />
                    ) : (
                        <img
                            src={item.src}
                            alt={`Slide ${index + 1}`}
                            className={`w-full h-full ${item.contain || item.src.includes('.gif') ? 'object-contain' : 'object-cover'} bg-surface-2`}
                            loading="lazy"
                        />
                    )}
                </div>
            ))}
            
            {media.length > 1 && (
                <>
                    <button onClick={prevSlide} aria-label="Previous slide" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-80 group-hover/carousel:opacity-100 transition-opacity z-20 hover:bg-black/70 backdrop-blur-sm cursor-pointer">
                        <ChevronLeft className="w-5 h-5 ml-0.5" />
                    </button>
                    <button onClick={nextSlide} aria-label="Next slide" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-80 group-hover/carousel:opacity-100 transition-opacity z-20 hover:bg-black/70 backdrop-blur-sm cursor-pointer">
                        <ChevronRight className="w-5 h-5 mr-0.5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                        {media.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

type SkillItem = {
    icon: React.ReactNode;
    title: string;
    desc: string;
    tags: string[];
    contextItems: { tool: string; context: string }[];
    gradient: string;
};

// Each card lists the tools; "Where I used it" swaps the chips for one line of
// evidence per tool, so a reader can check a claim without leaving the page.
const SkillCard = ({ skill, expanded, onToggle }: { skill: SkillItem; expanded: boolean; onToggle: () => void }) => {
    return (
        <div className="bg-surface border border-line rounded-lg p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-accent" aria-hidden="true">{skill.icon}</span>
                <h3 className="font-display text-lg font-semibold text-ink">{skill.title}</h3>
            </div>
            <p className="text-muted text-[15px] leading-relaxed mb-4">{skill.desc}</p>

            {!expanded ? (
                <ul className="flex flex-wrap gap-2">
                    {skill.tags.map((tag) => {
                        const logo = TECH_LOGOS[tag];
                        return (
                            <li key={tag} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[13px] bg-surface-2 border border-line text-ink">
                                {logo && <img src={logo} alt="" className="w-3.5 h-3.5 object-contain brightness-0 opacity-70 dark:invert" />}
                                {tag}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <dl className="divide-y divide-line border-t border-line">
                    {skill.contextItems.map((item) => (
                        <div key={item.tool} className="py-2 grid grid-cols-[minmax(0,9rem)_1fr] gap-3 text-[14px]">
                            <dt className="font-medium text-ink">{item.tool}</dt>
                            <dd className="text-muted min-w-0">{item.context}</dd>
                        </div>
                    ))}
                </dl>
            )}

            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="mt-4 self-start text-sm font-medium text-accent hover:underline underline-offset-4 cursor-pointer"
            >
                {expanded ? 'Show tools' : 'Where I used it'}
            </button>
        </div>
    );
};

const SkillsGrid = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_ITEMS.map((skill, i) => (
                <SkillCard
                    key={skill.title}
                    skill={skill as SkillItem}
                    expanded={expandedIndex === i}
                    onToggle={() => {
                        const newExpanded = expandedIndex === i ? null : i;
                        if (newExpanded !== null) {
                            trackEvent('Skills', 'Expand Skill', skill.title, { skill_name: skill.title });
                        }
                        setExpandedIndex(newExpanded);
                    }}
                />
            ))}
        </div>
    );
};

const SECTION_LINKS = [
    { id: 'experience', label: 'Experience' },
    { id: 'projects',   label: 'Projects'   },
    { id: 'skills',     label: 'Skills'     },
    { id: 'viz',        label: 'Data Viz'   },
    { id: 'about',      label: 'About'      },
] as const;

const RESUME_URL = '/Eduardo_Cornelsen_Data_Analyst_q2_2026.pdf';
const LINKEDIN_URL = 'https://linkedin.com/in/eduardo-cornelsen';
const GITHUB_URL = 'https://github.com/eduardocornelsen/';
const EMAIL = 'eduardo@eduardocornelsen.com';

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

// Shared button looks. Primary is the one action we most want (the résumé).
const BTN_PRIMARY = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-accent text-accent-ink font-semibold text-[15px] hover:bg-accent-strong transition-colors cursor-pointer';
const BTN_SECONDARY = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-line-strong text-ink font-medium text-[15px] hover:bg-surface-2 transition-colors cursor-pointer';

const SectionHeader = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) => (
    <header className="mb-10 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle mb-3">{eyebrow}</p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink text-balance">{title}</h2>
        {children && <div className="mt-3 text-muted text-[17px] leading-relaxed">{children}</div>}
    </header>
);

// Figures quoted in the hero ledger. Every one of them also appears, with its
// context, in the experience bullets below.
const LEDGER = [
    { value: '1,000+', label: 'diagnostic sessions with SMB owners', source: 'Omie' },
    { value: '~20%', label: 'average CPA reduction from channel mix', source: 'Torus clients' },
    { value: '2 h → 10 min', label: 'daily bank reconciliation, automated', source: 'Torus clients' },
    { value: '50+ h', label: 'of manual reporting removed per month', source: 'Torus clients' },
];

const PROOF_POINTS = [
    { title: 'Live data platform', detail: 'Postgres with RLS, 18 dbt models and an AI analyst over SQL for a specialty-coffee e-commerce.' },
    { title: 'Open-source governed analytics', detail: 'Full-Funnel AI Analytics: one metric definition, a tested golden layer, CI that fails on drift.' },
    { title: 'Final round, Epic Games (2026)', detail: 'Data Analyst role, with a Random Forest + NLP audit of the Epic Games Store.' },
];

function ModalCaseStudy({ readme, images }: { readme: string; images: Record<string, string> }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const max = scrollHeight - clientHeight;
            setProgress(max > 0 ? scrollTop / max : 0);
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="relative">
            <div className="sticky top-0 z-10 bg-surface border-b border-line px-6 sm:px-8 py-3 flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle shrink-0">Case study</span>
                <div className="flex-1 h-[2px] bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
                </div>
                <span className="font-mono text-[11px] tabular-nums text-subtle shrink-0">{Math.round(progress * 100)}%</span>
            </div>
            <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto overscroll-contain px-6 sm:px-8 py-8">
                <CaseStudyRenderer readme={readme} images={images} />
            </div>
        </div>
    );
}

function CaseStudyRenderer({ readme, images }: { readme: string; images: Record<string, string> }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h2: ({ children }) => (
                    <h2 className="text-xl font-display font-semibold text-ink mt-10 mb-4 pb-2 border-b border-line">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-ink mt-6 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                    <p className="text-muted leading-relaxed mb-4 text-[15px]">{children}</p>
                ),
                strong: ({ children }) => (
                    <strong className="text-ink font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="text-ink italic">{children}</em>
                ),
                ul: ({ children }) => (
                    <ul className="space-y-1.5 mb-4 pl-1">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="space-y-1.5 mb-4 pl-1 list-decimal list-inside">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="text-muted text-[15px] leading-relaxed flex gap-2.5 items-start">
                        <span className="text-accent mt-1 shrink-0">▸</span>
                        <span>{children}</span>
                    </li>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent pl-4 my-4 text-muted italic text-[15px]">{children}</blockquote>
                ),
                code: ({ children, className }) => {
                    const isBlock = className?.includes('language-');
                    return isBlock ? (
                        <code className="block bg-surface-2 border border-line rounded-xl px-4 py-3 text-xs text-accent font-mono overflow-x-auto whitespace-pre mb-4">{children}</code>
                    ) : (
                        <code className="bg-surface-2 text-accent text-xs font-mono px-1.5 py-0.5 rounded">{children}</code>
                    );
                },
                pre: ({ children }) => <div className="mb-4">{children}</div>,
                table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm border-collapse">{children}</table>
                    </div>
                ),
                thead: ({ children }) => <thead>{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                    <tr className="border-b border-line">{children}</tr>
                ),
                th: ({ children }) => (
                    <th className="text-left text-xs font-bold text-muted uppercase tracking-wider py-2 px-3 bg-surface-2">{children}</th>
                ),
                td: ({ children }) => (
                    <td className="text-muted py-2.5 px-3 text-[13px]">{children}</td>
                ),
                hr: () => <hr className="border-line my-8" />,
                img: ({ src, alt }) => {
                    const resolved = src && images[src] ? images[src] : src;
                    if (!resolved || (!images[src!] && !src?.startsWith('http'))) return null;

                    return (
                        <figure className="my-6">
                            <img
                                src={resolved}
                                alt={alt ?? ''}
                                className="w-full rounded-xl border border-line object-cover"
                                loading="lazy"
                            />
                            {alt && <figcaption className="text-center text-xs text-subtle mt-2">{alt}</figcaption>}
                        </figure>
                    );
                },
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">{children}</a>
                ),
            }}
        >
            {readme}
        </ReactMarkdown>
    );
}

const ExperienceItem = ({ exp }: { exp: typeof EXPERIENCES[number] }) => {
    const VISIBLE = 4;
    const [showAll, setShowAll] = useState(false);
    const bullets = showAll ? exp.bullets : exp.bullets.slice(0, VISIBLE);
    const hidden = exp.bullets.length - VISIBLE;
    const [company, ...where] = exp.company.split(' · ');

    return (
        <li className="grid md:grid-cols-[11rem_1fr] gap-x-8 gap-y-2 py-8 border-t border-line first:border-t-0">
            <p className="font-mono text-[13px] tabular-nums text-subtle pt-1">{exp.period.replace(' - ', ' – ')}</p>
            <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold text-ink leading-snug">
                    {exp.role} <span className="text-muted font-normal">· {company}</span>
                </h3>
                {where.length > 0 && <p className="text-sm text-subtle mt-1">{where.join(' · ')}</p>}
                {exp.intro && <p className="text-muted text-[15px] leading-relaxed mt-3 max-w-[70ch]">{exp.intro}</p>}
                <ul className="mt-4 space-y-2.5 max-w-[70ch]">
                    {bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                            <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-subtle" aria-hidden="true" />
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>
                {hidden > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="mt-3 text-sm font-medium text-accent hover:underline underline-offset-4 cursor-pointer"
                    >
                        {showAll ? 'Show less' : `Show ${hidden} more`}
                    </button>
                )}
            </div>
        </li>
    );
};

const ProjectCard = ({ proj, onOpen }: { proj: ProjectData; onOpen: () => void }) => (
    <article className="group bg-surface border border-line rounded-lg overflow-hidden flex flex-col hover:border-line-strong transition-colors">
        <button type="button" onClick={onOpen} className="block w-full aspect-video bg-surface-2 overflow-hidden cursor-pointer" aria-label={`Open case study: ${proj.title}`}>
            <img
                src={proj.cover}
                alt=""
                loading="lazy"
                className={`w-full h-full ${proj.coverContain ? 'object-contain' : 'object-cover object-top'} group-hover:scale-[1.02] transition-transform duration-300`}
            />
        </button>
        <div className="p-6 flex flex-col flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-accent mb-2">{proj.outcome}</p>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">{proj.title}</h3>
            <p className="text-muted text-[15px] leading-relaxed line-clamp-3 mb-4">{proj.desc}</p>
            <ul className="flex flex-wrap gap-1.5 mb-5">
                {proj.tags.slice(0, 4).map((tag) => (
                    <li key={tag} className="px-2 py-0.5 rounded text-[12.5px] bg-surface-2 text-muted border border-line">{tag}</li>
                ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
                <button
                    type="button"
                    onClick={onOpen}
                    className="inline-flex items-center gap-1.5 text-accent hover:underline underline-offset-4 cursor-pointer"
                >
                    Case study <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-ink hover:text-accent"
                       onClick={() => trackEvent('Project', 'Click Live Demo', proj.title, { project_name: proj.title })}>
                        {proj.title === 'PunkSQL' ? 'Play' : 'Live demo'}
                    </a>
                )}
                {proj.presentationUrl && (
                    <a href={proj.presentationUrl} target="_blank" rel="noreferrer" className="text-ink hover:text-accent"
                       onClick={() => trackEvent('Project', 'Click Presentation', proj.title, { project_name: proj.title })}>
                        Slides
                    </a>
                )}
                {proj.github ? (
                    <a href={proj.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:text-accent"
                       onClick={() => trackEvent('Project', 'Click GitHub', proj.title, { project_name: proj.title })}>
                        <GithubIcon className="w-3.5 h-3.5" /> Code
                    </a>
                ) : (
                    <span className="text-muted">Code private</span>
                )}
            </div>
        </div>
    </article>
);

const CREDENTIALS = [
    { kicker: 'Insper · São Paulo', title: 'Bachelor of Business Administration (BBA)', note: 'Triple accredited (AACSB, AMBA, EQUIS)', href: 'https://www.insper.edu.br/en/home' },
    { kicker: 'Aarhus University · Denmark', title: 'Exchange: Innovation & Global Business', note: 'Triple accredited business school', href: 'https://international.au.dk/' },
    { kicker: 'TripleTen · Jul 2025 – present', title: 'Data Science Program (700h+)', note: '16 end-to-end projects: statistics, ML, churn modeling, LangChain agents, Databricks/PySpark', href: 'https://tripleten.com/data-scientist/' },
    { kicker: 'Databricks Academy · Apr 2026', title: 'Accreditations: Databricks Fundamentals & AI Agent Fundamentals', note: 'Medallion architecture, AI agents, MCP', href: 'https://www.databricks.com/learn/certification' },
    { kicker: 'Falconi', title: 'Lean Six Sigma Green Belt', note: 'Awarded for the B.blend executive-board recommendation', href: 'https://falconi.com/' },
    { kicker: 'MIT D-Lab · Boston', title: 'Innovation Award: Best Project', note: 'Presented to an MIT Master’s & PhD panel', href: 'https://d-lab.mit.edu/' },
];

export default function PortfolioEduardo() {
    const activeSection = useBehaviorTracking();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

    useEffect(() => {
        const originalTitle = document.title;
        document.title = 'Eduardo Cornelsen — Data Analyst & Analytics Engineer Portfolio';
        return () => {
            document.title = originalTitle;
        };
    }, []);

    useEffect(() => {
        if (!selectedProject) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedProject(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedProject]);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openProject = (proj: ProjectData) => {
        setSelectedProject(proj);
        trackEvent('Project', 'View Details', proj.title, { project_name: proj.title });
    };

    const profileImg = new URL('../assets/logos/Profile_compressed.webp', import.meta.url).href;

    return (
        <MotionConfig reducedMotion="user">
        <div className="bg-paper text-ink min-h-screen">
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:bg-surface focus:px-3 focus:py-2 focus:rounded">Skip to content</a>

            {/* ═══ NAVIGATION ═══ */}
            <nav id="main-nav" className="sticky top-0 z-[90] bg-paper/90 backdrop-blur border-b border-line">
                <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-6">
                    <a href="#" className="font-display text-lg font-semibold tracking-tight text-ink">Eduardo Cornelsen</a>

                    <div className="hidden md:flex items-center gap-7">
                        {SECTION_LINKS.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => scrollToSection(id)}
                                aria-current={activeSection === id ? 'true' : undefined}
                                className={`text-[15px] cursor-pointer transition-colors ${activeSection === id ? 'text-ink underline underline-offset-[6px] decoration-accent decoration-2' : 'text-muted hover:text-ink'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <a href={`mailto:${EMAIL}`} className="text-[15px] text-muted hover:text-ink">Contact</a>
                        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-muted hover:text-ink p-1"
                           onClick={() => trackEvent('Navigation', 'Click GitHub', 'Navbar')}>
                            <span className="sr-only">GitHub</span>
                            <GithubIcon />
                        </a>
                        <a href={RESUME_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-line-strong text-[14px] font-medium text-ink hover:bg-surface-2"
                           onClick={() => trackEvent('Navigation', 'Download Resume', 'Navbar')}>
                            <Download className="w-3.5 h-3.5" /> Resume
                        </a>
                    </div>

                    <button
                        type="button"
                        className="md:hidden p-2 -mr-2 text-ink cursor-pointer"
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden border-t border-line bg-paper px-5 py-4 flex flex-col gap-1">
                        {SECTION_LINKS.map(({ id, label }) => (
                            <button key={id} type="button" className="text-left py-2.5 text-ink cursor-pointer"
                                    onClick={() => { setIsMenuOpen(false); setTimeout(() => scrollToSection(id), 50); }}>
                                {label}
                            </button>
                        ))}
                        <div className="flex gap-3 pt-3">
                            <a href={RESUME_URL} target="_blank" rel="noreferrer" className={`${BTN_PRIMARY} flex-1`}
                               onClick={() => trackEvent('Mobile Menu', 'Download Resume', 'Mobile Nav')}>
                                <Download className="w-4 h-4" /> Resume
                            </a>
                            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={`${BTN_SECONDARY} flex-1`}>
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </a>
                        </div>
                    </div>
                )}
            </nav>

            <main id="main">
            {/* ═══ HERO ═══ */}
            <section className="px-5 md:px-8 pt-14 md:pt-20 pb-14">
                <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-start">
                    <div className="min-w-0 order-2 md:order-1">
                        <p className="inline-flex items-center gap-2 font-mono text-[13px] text-accent mb-5">
                            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                            Open to remote roles · US / EU · UTC−3
                        </p>
                        <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight text-ink leading-[1.02]">
                            Eduardo Cornelsen
                        </h1>
                        <p className="font-display text-2xl md:text-[28px] text-muted mt-3 tracking-tight">
                            Data Analyst &amp; Analytics Engineer
                        </p>
                        <p className="mt-6 text-[18px] leading-relaxed text-ink max-w-[62ch]">
                            I build governed analytics layers: dbt models, tested metric definitions and semantic layers, plus the dashboards and AI analysts that read from them.
                            Five years in analytics, after two years selling ERP software at Omie, so I start from the business question.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href={RESUME_URL} target="_blank" rel="noreferrer" className={BTN_PRIMARY}
                               onClick={() => trackEvent('Hero', 'Download Resume', 'Hero CTA')}>
                                <Download className="w-4 h-4" /> Download resume
                            </a>
                            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={BTN_SECONDARY}
                               onClick={() => trackEvent('Hero', 'Click LinkedIn', 'Hero CTA')}>
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </a>
                            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={BTN_SECONDARY}
                               onClick={() => trackEvent('Hero', 'Click GitHub', 'Hero CTA')}>
                                <GithubIcon /> GitHub
                            </a>
                        </div>
                    </div>
                    <img
                        src={profileImg}
                        alt="Eduardo Cornelsen"
                        width="176" height="176"
                        className="order-1 md:order-2 w-24 h-24 md:w-44 md:h-44 rounded-full object-cover border border-line"
                    />
                </div>

                <ul className="max-w-6xl mx-auto mt-12 grid md:grid-cols-3 gap-px bg-line border border-line rounded-lg overflow-hidden">
                    {PROOF_POINTS.map((p) => (
                        <li key={p.title} className="bg-surface p-5">
                            <p className="font-display font-semibold text-ink">{p.title}</p>
                            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{p.detail}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ═══ LEDGER ═══ */}
            <section aria-label="Results" className="px-5 md:px-8 py-10 border-y border-line bg-surface">
                <dl className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
                    {LEDGER.map((row) => (
                        <div key={row.label} className="bg-surface p-5 flex flex-col">
                            <dt className="order-2 mt-1 text-[14px] text-muted leading-snug">{row.label}</dt>
                            <dd className="order-1 font-mono text-[22px] md:text-[28px] tabular-nums text-ink whitespace-nowrap">{row.value}</dd>
                            <dd className="order-3 mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-subtle">{row.source}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* ═══ EXPERIENCE ═══ */}
            <section id="experience" className="px-5 md:px-8 py-20 scroll-mt-16">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader eyebrow="Experience" title="Where the work happened" />
                    <ol>
                        {EXPERIENCES.map((exp) => <ExperienceItem key={exp.role + exp.period} exp={exp} />)}
                    </ol>
                    <div className="mt-10 pt-8 border-t border-line">
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle mb-5">Clients and projects include</p>
                        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
                            {LOGOS_IMPACTED.map((logo) => (
                                <li key={logo.name}>
                                    <a href={logo.href} target="_blank" rel="noreferrer" title={logo.name}>
                                        <img src={logo.src} alt={logo.name} className="h-8 w-auto max-w-[140px] object-contain brightness-0 opacity-55 hover:opacity-90 dark:invert transition-opacity" loading="lazy" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ═══ PROJECTS ═══ */}
            <section id="projects" className="px-5 md:px-8 py-20 bg-surface-2 border-y border-line scroll-mt-16">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader eyebrow="Projects" title="Case studies">
                        Each card opens the full write-up: the question, the build, and what it does and doesn't prove.
                    </SectionHeader>
                    <div className="grid md:grid-cols-2 gap-6">
                        {PROJECTS.map((proj) => (
                            <ProjectCard key={proj.title} proj={proj} onOpen={() => openProject(proj)} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SKILLS ═══ */}
            <section id="skills" className="px-5 md:px-8 py-20 scroll-mt-16">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader eyebrow="Skills" title="Tools, and where I used them" />
                    <SkillsGrid />
                </div>
            </section>

            {/* ═══ DATA VIZ ═══ — interactive demos keep their own dark stage */}
            <div id="viz" className="scroll-mt-16 bg-zinc-950 text-white">
                <Suspense fallback={<div className="w-full h-96" />}>
                    <DataVizShowcase />
                    <DashboardShowcase
                        subtitle="Live BI & Strategic Reporting"
                        title={<>Analytics Command Centers for Every Sector</>}
                        description="Explore automated, real-time dashboards — mirroring the BI architectures developed for Torus Analytics and Mandalah."
                    />
                </Suspense>
            </div>

            {/* ═══ ABOUT ═══ */}
            <section id="about" className="px-5 md:px-8 py-20 scroll-mt-16">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16">
                    <div className="min-w-0">
                        <SectionHeader eyebrow="About" title="I’ve sat in the revenue meetings" />
                        <div className="space-y-5 text-[17px] leading-relaxed text-ink max-w-[62ch] -mt-4">
                            <p>
                                I have 5 years in analytics, independent consulting for SMBs since 2021, after 2 years of consultative B2B SaaS sales at Omie, Brazil’s leading cloud ERP.
                            </p>
                            <p>
                                Because I’ve sat in the revenue meetings, I understand the business problem behind the ticket. I know what the VP of Sales needs by Monday, and I build the analytics that answers it before they ask.
                            </p>
                            <p className="text-muted">
                                Right now I’m building the data platform for a live specialty-coffee e-commerce: Postgres with row-level security, dbt, margin and P&amp;L reporting, and an AI analyst that answers questions over SQL without ever computing a number itself.
                            </p>
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle mb-4 lg:mt-1">Education &amp; credentials</p>
                        <ul className="grid sm:grid-cols-2 gap-4">
                            {CREDENTIALS.map((c) => (
                                <li key={c.title} className="bg-surface border border-line rounded-lg p-5">
                                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="block group">
                                        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-subtle">{c.kicker}</p>
                                        <p className="mt-2 font-display font-semibold text-ink leading-snug group-hover:text-accent">{c.title}</p>
                                        <p className="mt-1.5 text-[14px] text-muted leading-relaxed">{c.note}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
            </main>

            {/* ═══ PROJECT MODAL ═══ */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[200] flex items-start justify-center p-4 sm:p-6 py-8 md:py-14 overflow-y-auto"
                        onClick={() => setSelectedProject(null)}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label={selectedProject.title}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                            transition={{ duration: 0.2 }}
                            className="bg-surface text-ink rounded-lg max-w-4xl w-full overflow-hidden border border-line shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                <MediaCarousel media={selectedProject.media} containerClasses="h-64 sm:h-80 w-full bg-surface-2" />
                                <button onClick={(e) => { e.stopPropagation(); setSelectedProject(null); }} aria-label="Close"
                                        className="absolute z-30 top-3 right-3 w-9 h-9 bg-surface/90 border border-line rounded-full flex items-center justify-center hover:bg-surface cursor-pointer">
                                    <X className="w-4 h-4 text-ink" />
                                </button>
                            </div>

                            <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-line">
                                <p className="font-mono text-xs uppercase tracking-[0.1em] text-accent mb-2">{selectedProject.outcome}</p>
                                <h3 className="font-display text-2xl font-semibold mb-3">{selectedProject.title}</h3>
                                <ul className="flex flex-wrap gap-1.5">
                                    {selectedProject.tags.map((tag) => (
                                        <li key={tag} className="px-2 py-0.5 rounded text-[12.5px] bg-surface-2 text-muted border border-line">{tag}</li>
                                    ))}
                                </ul>
                                <p className="text-muted leading-relaxed text-[15px] mt-5 mb-6 max-w-[70ch]">{selectedProject.desc}</p>
                                <div className="flex flex-wrap gap-3">
                                    {selectedProject.liveUrl && (
                                        <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className={BTN_PRIMARY}
                                           onClick={() => trackEvent('Project Modal', 'Click Live Demo', selectedProject.title, { project_name: selectedProject.title })}>
                                            <Zap className="w-4 h-4" /> {selectedProject.title === 'PunkSQL' ? 'Play' : 'Live demo'}
                                        </a>
                                    )}
                                    {selectedProject.github && (
                                        <a href={selectedProject.github} target="_blank" rel="noreferrer" className={BTN_SECONDARY}
                                           onClick={() => trackEvent('Project Modal', 'Click GitHub', selectedProject.title, { project_name: selectedProject.title })}>
                                            <GithubIcon /> GitHub
                                        </a>
                                    )}
                                    {selectedProject.presentationUrl && (
                                        <a href={selectedProject.presentationUrl} target="_blank" rel="noreferrer" className={BTN_SECONDARY}
                                           onClick={() => trackEvent('Project Modal', 'Click Presentation', selectedProject.title, { project_name: selectedProject.title })}>
                                            <BookOpen className="w-4 h-4" /> Presentation
                                        </a>
                                    )}
                                </div>
                            </div>

                            {selectedProject.readme && (
                                <ModalCaseStudy readme={selectedProject.readme} images={selectedProject.images ?? {}} />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ FOOTER ═══ */}
            <footer className="px-5 md:px-8 pt-20 pb-28 border-t border-line bg-surface">
                <div className="max-w-6xl mx-auto">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-subtle mb-3">Contact</p>
                    <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink max-w-[24ch] text-balance">
                        If your revenue data raises more questions than it answers, let’s talk.
                    </h2>
                    <p className="mt-4 text-muted text-[17px]">Available for Data Analyst and Analytics Engineering roles. I reply within 24 hours.</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href={`mailto:${EMAIL}`} className={BTN_PRIMARY} onClick={() => trackEvent('Contact', 'Click Email', 'Footer')}>
                            <Mail className="w-4 h-4" /> {EMAIL}
                        </a>
                        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={BTN_SECONDARY}
                           onClick={() => trackEvent('Footer', 'Click LinkedIn', 'Footer CTA')}>
                            <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                        <a href={RESUME_URL} target="_blank" rel="noreferrer" className={BTN_SECONDARY}
                           onClick={() => trackEvent('Footer', 'Download Resume', 'Footer CTA')}>
                            <Download className="w-4 h-4" /> Resume
                        </a>
                    </div>
                    <div className="mt-16 pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-3 text-sm text-subtle">
                        <span className="font-display font-semibold text-ink">Eduardo Cornelsen</span>
                        <span>&copy; {new Date().getFullYear()} Eduardo Cornelsen. Built with React &amp; Tailwind.</span>
                    </div>
                </div>
            </footer>
            <Chatbot />
        </div>
        </MotionConfig>
    );
}
