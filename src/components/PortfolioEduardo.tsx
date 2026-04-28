import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValue, useAnimationFrame } from 'motion/react';
import { trackEvent } from '../utils/analytics';
import { Chatbot } from './chatbot';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import fullFunnelReadme from '../content/projects/full-funnel-ai-analytics/README.md?raw';
import punksqlReadme from '../content/projects/punksql/README.md?raw';
import leadEngineReadme from '../content/projects/lead_engine/README.md?raw';
import epicReadme from '../content/projects/epic-store-analysis/README.md?raw';
import musicReadme from '../content/projects/music-insights-ai-alt/README.md?raw';
import portfolioInfraReadme from '../content/projects/portfolio-infra/README.md?raw';
import { 
    ArrowRight, LineChart as BarChart3, Bot, Zap, BookOpen, Database, 
    X, Menu, Mail, Linkedin, Sparkles, TrendingUp, Briefcase, GraduationCap, ChevronLeft, ChevronRight, Quote, ShoppingBag, Globe, Terminal
} from 'lucide-react';
const TorusField = lazy(() => import('./TorusField'));
const AboutTorus = lazy(() => import('./AboutTorus'));
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
            { tool: "PostgreSQL",      context: "Primary OLTP source · Torus client stack" },
            { tool: "Python",          context: "Core language · ETL, automation, modeling" },
            { tool: "dbt Core",         context: "29 models · Medallion Architecture · 2.2M rows" },
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
            { tool: "Databricks", context: "PySpark notebooks · TripleTen lakehouse · 2× fundamentals certs" },
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
        tags: ["Google Antigravity", "Claude Code", "Gemini Flash", "LangChain", "MCP", "FastAPI", "Scikit-Learn", "Langfuse"],
        contextItems: [
            { tool: "Google Antigravity", context: "Primary agentic IDE · Claude Code + Gemini Flash" },
            { tool: "Claude Code",        context: "Agentic coding · Antigravity, Desktop & Mobile" },
            { tool: "Gemini Flash",       context: "Portfolio chatbot · Antigravity IDE · TripleTen agents" },
            { tool: "LangChain",          context: "Chat with Data agents · TripleTen" },
            { tool: "MCP",                context: "7 servers · Full-Funnel AI Platform" },
            { tool: "FastAPI",            context: "XGBoost lead scoring endpoint" },
            { tool: "Scikit-Learn",       context: "XGBoost lead scoring model" },
            { tool: "Langfuse",           context: "LLM observability · portfolio chatbot" },
        ],
        gradient: "from-violet-500 to-purple-500",
    },
    {
        icon: <Zap className="w-5 h-5" />,
        title: "Automation & Revenue Ops",
        desc: "Eliminating manual work through intelligent workflow orchestration.",
        tags: ["n8n", "Python Scripts", "API Integration", "NotebookLM", "Obsidian"],
        contextItems: [
            { tool: "n8n",            context: "SDR automation workflows · Torus clients" },
            { tool: "Python Scripts", context: "ETL automation · reporting pipelines" },
            { tool: "API Integration",context: "Multi-platform data connectors" },
            { tool: "NotebookLM",     context: "Research & knowledge synthesis" },
            { tool: "Obsidian",       context: "Systems documentation & knowledge base" },
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

// CSS approximation of the Three.js wireframe torus shown while vendor-three.js loads.
// Uses the same emerald palette and slow rotation so the hero never looks broken.
function TorusFallback() {
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
            {/* Outer ring — torus perimeter */}
            <div
                className="absolute rounded-full border border-emerald-500/40 animate-[spin_24s_linear_infinite]"
                style={{
                    width:  'clamp(200px, 60vmin, 520px)',
                    height: 'clamp(200px, 60vmin, 520px)',
                    boxShadow: '0 0 80px rgba(16,185,129,0.10), inset 0 0 40px rgba(16,185,129,0.06)',
                }}
            />
            {/* Horizontal cross-section ellipse */}
            <div
                className="absolute rounded-full border border-emerald-400/20 animate-[spin_32s_linear_infinite]"
                style={{
                    width:  'clamp(200px, 60vmin, 520px)',
                    height: 'clamp(66px,  20vmin, 174px)',
                }}
            />
            {/* Second cross-section at 60° */}
            <div
                className="absolute rounded-full border border-emerald-400/20 animate-[spin_40s_linear_infinite_reverse]"
                style={{
                    width:     'clamp(200px, 60vmin, 520px)',
                    height:    'clamp(66px,  20vmin, 174px)',
                    transform: 'rotate(60deg)',
                }}
            />
            {/* Inner ring — torus hole */}
            <div
                className="absolute rounded-full border border-emerald-500/25 animate-[spin_18s_linear_infinite_reverse]"
                style={{
                    width:  'clamp(76px, 23vmin, 200px)',
                    height: 'clamp(76px, 23vmin, 200px)',
                }}
            />
        </div>
    );
}

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
        <div ref={ref} className={`w-full h-full ${contain ? 'bg-zinc-950' : 'bg-zinc-900'}`}>
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
    gradient: string;
    tags: string[];
    github: string;
    liveUrl?: string;
    presentationUrl?: string;
    readme?: string;
    images?: Record<string, string>;
};

const PROJECTS: ProjectData[] = [
    {
        title: "Full-Funnel AI Analytics Platform",
        outcome: "2.2M+ Rows · 4 Attribution Models",
        desc: "Revenue teams flying blind on attribution? I built a 29-model dbt pipeline with 4 attribution models that turned 2.2M+ rows into a natural language query layer — delivering answers in 15 seconds that used to take days. Powered by MCP, dbt Semantic Layer, and a real-time React dashboard.",
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
        tags: ["dbt", "BigQuery", "MCP", "React", "TypeScript", "Claude", "Semantic Layer"],
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
        title: "PunkSQL",
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
        title: "RevOps Lead Engine",
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
        title: "Product & UX Analytics (Epic Games)",
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
        title: "Portfolio Infrastructure & AI Chatbot",
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
    {
        title: "MusicInsights AI",
        outcome: "160k+ Tracks · 100 Years of Data",
        desc: "What separates a hit from a miss? I analyzed 160k+ tracks spanning 100 years of music evolution using an AI consultant powered by LangChain and Gemini 3 Flash — surfacing interactive trend visualizations and answering music insight questions in natural language.",
        media: [
            { type: 'image', src: new URL('../assets/projects/spotify-project/dashboard.webp', import.meta.url).href },
            { type: 'image', src: new URL('../assets/projects/spotify-project/chatbot.webp', import.meta.url).href },
            { type: 'image', src: new URL('../assets/projects/spotify-project/insights.webp', import.meta.url).href },
            { type: 'image', src: new URL('../assets/projects/spotify-project/Architecture.png', import.meta.url).href, contain: true },
        ],
        gradient: "from-sky-500 to-blue-500",
        tags: ["LangChain", "Gemini 3 Flash", "Streamlit", "Pandas"],
        github: "https://github.com/eduardocornelsen/music-insights-ai",
        liveUrl: "https://spotify-music-insights-ai.streamlit.app/",
        readme: musicReadme,
        images: {
            'chatbot.webp': new URL('../assets/projects/spotify-project/chatbot.webp', import.meta.url).href,
            'dashboard.webp': new URL('../assets/projects/spotify-project/dashboard.webp', import.meta.url).href,
            'insights.webp': new URL('../assets/projects/spotify-project/insights.webp', import.meta.url).href,
            'architecture.png': new URL('../assets/projects/spotify-project/Architecture.png', import.meta.url).href,
        },
    }
];

const EXPERIENCES = [
    {
        role: "Data Science & Analytics Residency",
        badge: "Training Program",
        company: "TripleTen · Data Science Program",
        period: "Jul 2025 - Present",
        logo: new URL('../assets/logos/tripleten.png', import.meta.url).href,
        intro: "Enrolled in a 700h+ intensive program in Data Science, ML, and AI — delivering 16 end-to-end projects on real business problems.",
        bullets: [
            "Built 'Chat with Data' AI agents using LangChain, LangGraph, and Gemini/Claude APIs — enabling natural language querying over structured datasets.",
            "Consolidated 200,000+ records to model churn patterns using statistical forecasting, surfacing retention levers and LTV drivers.",
            "Worked with Databricks (PySpark, notebooks) for product analytics and feature engineering in a lakehouse environment."
        ]
    },
    {
        role: "Business Intelligence & Analytics Lead",
        company: "Torus Analytics · Remote",
        period: "Jul 2021 - Present",
        logo: new URL('../assets/logos/torus-logo.svg', import.meta.url).href,
        intro: "Independent analytics consultancy serving SMB clients across automotive, retail, agribusiness, and hospitality.",
        bullets: [
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
        role: "Business & Data Analyst Intern",
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
            "Applied PDCA, Ishikawa root-cause analysis, and McKinsey problem-solving methodology to diagnose conversion funnel friction and prioritize high-impact fixes.",
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

const LOGOS_MAIN = [
    { name: 'Torus', label: 'Torus Analytics', href: 'https://www.torusanalytics.com/' },
    { name: 'Omie', src: omiePng, size: 'h-10 md:h-12 max-w-[130px] md:max-w-[160px]', href: 'https://omie.com/' },
    { name: 'Mandalah', src: new URL('../assets/logos/mandalah.webp', import.meta.url).href, size: 'h-10 md:h-12 max-w-[130px] md:max-w-[160px]', href: 'https://www.mandalah.com/' },
    { name: 'B.blend', src: new URL('../assets/logos/bblend.webp', import.meta.url).href, size: 'h-10 md:h-12 max-w-[130px] md:max-w-[160px]', href: 'https://loja.bblend.com.br/' },
    { name: 'Estudar com Você', src: new URL('../assets/logos/estudar-com-voce.webp', import.meta.url).href, size: 'h-12 md:h-16 max-w-[160px] md:max-w-[200px]', href: 'https://estudar.com.vc/' },
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
                            className={`w-full h-full ${item.contain || item.src.includes('.gif') ? 'object-contain' : 'object-cover'} ${item.contain ? 'bg-zinc-950/50' : 'bg-zinc-900'}`}
                            loading="lazy"
                        />
                    )}
                </div>
            ))}
            
            {media.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 hover:bg-black/70 backdrop-blur-sm cursor-pointer">
                        <ChevronLeft className="w-5 h-5 ml-0.5" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 hover:bg-black/70 backdrop-blur-sm cursor-pointer">
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

const LogoMarquee = ({ logos, mainLogos }: { logos: any[], mainLogos: any[] }) => {
    const marqueeItems = [
        ...logos.map((l, i) => ({ ...l, id: `l1-${i}` })),
        ...logos.map((l, i) => ({ ...l, id: `l2-${i}` })),
    ];

    // Impacted marquee — scrolls right (x: -half → 0, wraps)
    const impactedX = useMotionValue(0);
    const impactedRef = useRef<HTMLDivElement>(null);
    const impactedDragging = useRef(false);

    // Mobile worked-for marquee — scrolls left (x: 0 → -half, wraps)
    const workedX = useMotionValue(0);
    const workedRef = useRef<HTMLDivElement>(null);
    const workedDragging = useRef(false);

    useEffect(() => {
        if (impactedRef.current) {
            impactedX.set(-impactedRef.current.scrollWidth / 2);
        }
    }, []);

    useAnimationFrame((_, delta) => {
        if (!impactedDragging.current && impactedRef.current) {
            const half = impactedRef.current.scrollWidth / 2;
            if (half > 0) {
                let v = impactedX.get() + (40 * delta / 1000);
                if (v >= 0) v -= half;
                impactedX.set(v);
            }
        }
        if (!workedDragging.current && workedRef.current) {
            const half = workedRef.current.scrollWidth / 2;
            if (half > 0) {
                let v = workedX.get() - (40 * delta / 1000);
                if (v <= -half) v += half;
                workedX.set(v);
            }
        }
    });

    return (
        <div className="relative w-full overflow-hidden py-10 group">
            {/* Edge Fading Gradients */}
            <div className="absolute inset-y-0 left-0 w-48 md:w-80 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-48 md:w-80 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
            
            {/* ═══ COMPANIES I'VE WORKED FOR ═══ */}
            <div className="mb-8 relative z-20">
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mb-6 text-center px-6">Companies I've Worked For</p>

                {/* Desktop: static flex row */}
                <div className="hidden md:flex flex-wrap justify-center gap-16 items-center px-6 max-w-7xl mx-auto">
                    {mainLogos.map((logo, i) => (
                        <a
                            key={i}
                            href={logo.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0"
                        >
                            {logo.name === 'Torus' ? (
                                <span className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                                    <img src={new URL('../assets/logos/torus-logo.svg', import.meta.url).href} alt="Torus Logo" className="w-11 h-11 rounded brightness-0 invert" loading="lazy" width="44" height="44" />
                                    <span className="text-white">Torus Analytics</span>
                                </span>
                            ) : (
                                <img src={logo.src} alt={logo.name} className={`${logo.size} w-auto object-contain brightness-0 invert`} loading="lazy" width="150" height="40" />
                            )}
                        </a>
                    ))}
                </div>

                {/* Mobile: scrolling marquee */}
                <div className="md:hidden overflow-hidden cursor-grab active:cursor-grabbing">
                    <motion.div
                        ref={workedRef}
                        style={{ x: workedX }}
                        drag="x"
                        dragElastic={0}
                        dragMomentum={false}
                        onDragStart={() => { workedDragging.current = true; }}
                        onDragEnd={() => { workedDragging.current = false; }}
                        className="flex items-center gap-14 w-max px-8"
                    >
                        {[...mainLogos, ...mainLogos].map((logo, i) => (
                            <a
                                key={i}
                                href={logo.href}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-shrink-0 flex items-center justify-center transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0"
                            >
                                {logo.name === 'Torus' ? (
                                    <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
                                        <img src={new URL('../assets/logos/torus-logo.svg', import.meta.url).href} alt="Torus Logo" className="w-8 h-8 rounded brightness-0 invert" loading="lazy" width="32" height="32" />
                                        <span className="text-white">Torus Analytics</span>
                                    </span>
                                ) : (
                                    <img src={logo.src} alt={logo.name} className={`${logo.size} w-auto object-contain brightness-0 invert`} loading="lazy" width="120" height="32" />
                                )}
                            </a>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="w-24 h-px bg-white/10 mx-auto mb-8 relative z-20" />

            {/* ═══ COMPANIES I'VE IMPACTED ═══ */}
            <div className="max-w-7xl mx-auto px-6 text-center mb-6 relative z-20">
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em]">Companies I've Impacted</p>
            </div>

            <motion.div
                ref={impactedRef}
                style={{ x: impactedX }}
                drag="x"
                dragElastic={0}
                dragMomentum={false}
                onDragStart={() => { impactedDragging.current = true; }}
                onDragEnd={() => { impactedDragging.current = false; }}
                className="flex items-center gap-20 md:gap-28 w-max px-8 relative z-20 cursor-grab active:cursor-grabbing"
            >
                {marqueeItems.map((item) => (
                    <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-110 flex items-center justify-center grayscale hover:grayscale-0"
                    >
                        <img src={item.src} alt={item.name} className={`${item.size} w-auto object-contain brightness-0 invert`} loading="lazy" />
                    </a>
                ))}
            </motion.div>

            {/* Static pill */}
            <div className="flex justify-center mt-8 relative z-20">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    <span className="text-[10px] md:text-xs font-black text-emerald-400">+200</span>
                    <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">SMB & Enterprise Operations Transformed</span>
                </div>
            </div>
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

const SkillCard = ({ skill, index, expanded, onToggle }: { skill: SkillItem; index: number; expanded: boolean; onToggle: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            onClick={onToggle}
            className="relative bg-zinc-900 border border-white/5 hover:border-white/15 rounded-3xl p-7 flex flex-col cursor-pointer transition-colors duration-200"
        >
            <div className="flex items-start justify-between mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${skill.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    {skill.icon}
                </div>
                <motion.div
                    animate={{ rotate: expanded ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mt-0.5 flex-shrink-0"
                >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/></svg>
                </motion.div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{skill.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">{skill.desc}</p>

            {/* Pills ↔ context rows: same slot, crossfade on toggle */}
            <AnimatePresence mode="wait" initial={false}>
                {!expanded ? (
                    <motion.div
                        key="pills"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-wrap gap-2"
                    >
                        {skill.tags.map((tag, t) => {
                            const logo = TECH_LOGOS[tag];
                            return (
                                <span key={t} className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10.5px] font-bold bg-white/5 border border-white/10 text-zinc-300 cursor-default">
                                    {logo ? (
                                        <img src={logo} alt={tag} className="w-3.5 h-3.5 object-contain brightness-0 invert" />
                                    ) : (
                                        <div className="w-1 h-1 rounded-full bg-zinc-500" />
                                    )}
                                    {tag}
                                </span>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="context"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col pt-3 border-t border-white/8"
                    >
                        {skill.contextItems.map((item, ci) => {
                            const logo = TECH_LOGOS[item.tool];
                            return (
                                <div
                                    key={ci}
                                    className={`flex items-center gap-2.5 py-2 ${
                                        ci < skill.contextItems.length - 1
                                            ? 'border-b border-white/[0.05]'
                                            : ''
                                    }`}
                                >
                                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                        {logo ? (
                                            <img src={logo} alt="" className="w-4 h-4 object-contain brightness-0 invert opacity-70" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                        )}
                                    </div>
                                    <span className="text-[13px] font-medium text-zinc-200 flex-shrink-0">{item.tool}</span>
                                    <span className="text-zinc-600 text-[12px] flex-shrink-0">·</span>
                                    <span className="text-[11.5px] text-zinc-500 leading-snug min-w-0">{item.context}</span>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const SkillsGrid = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SKILL_ITEMS.map((skill, i) => (
                <SkillCard
                    key={i}
                    skill={skill as SkillItem}
                    index={i}
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

const HERO_PHRASES = [
    "I build the ones that drive decisions.",
    "I build the systems that accelerate revenue.",
    "I architect the data pipelines that power them."
];

const TextTransition = ({ phrases }: { phrases: string[] }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % phrases.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ 
                        duration: 0.8, 
                        ease: [0.23, 1, 0.32, 1] 
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 whitespace-normal">
                        {phrases[index]}
                    </span>
                </motion.div>
            </AnimatePresence>
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

const SectionNav = ({ activeSection, visible }: { activeSection: string; visible: boolean }) => {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="md:hidden fixed bottom-0 left-0 z-[80] w-full border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl pb-[safe-area-inset-bottom]"
                >
                    <div className="max-w-7xl mx-auto px-3 py-3">
                        <div className="grid grid-cols-5 gap-1">
                            {SECTION_LINKS.map(({ id, label }) => {
                                const isActive = activeSection === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => scrollTo(id)}
                                        className={`relative py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                                            isActive
                                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                                : 'text-zinc-500 bg-transparent border border-transparent hover:text-zinc-300'
                                        }`}
                                    >
                                        <span className={isActive ? 'opacity-100' : 'opacity-0'}>
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        </span>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function ModalCaseStudy({ readme, images, gradient }: { readme: string; images: Record<string, string>; gradient: string }) {
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
            {/* Reading progress bar */}
            <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-white/5 px-8 py-3 flex items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest shrink-0">Case Study</span>
                <div className="flex-1 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                        style={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">{Math.round(progress * 100)}%</span>
            </div>

            {/* Scrollable article */}
            <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto overscroll-contain px-8 py-8 scroll-smooth">
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
                    <h2 className="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-zinc-200 mt-6 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                    <p className="text-zinc-400 leading-relaxed mb-4 text-[15px]">{children}</p>
                ),
                strong: ({ children }) => (
                    <strong className="text-zinc-200 font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="text-zinc-300 italic">{children}</em>
                ),
                ul: ({ children }) => (
                    <ul className="space-y-1.5 mb-4 pl-1">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="space-y-1.5 mb-4 pl-1 list-decimal list-inside">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="text-zinc-400 text-[15px] leading-relaxed flex gap-2.5 items-start">
                        <span className="text-emerald-500 mt-1 shrink-0">▸</span>
                        <span>{children}</span>
                    </li>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-emerald-500/60 pl-4 my-4 text-zinc-400 italic text-[15px]">{children}</blockquote>
                ),
                code: ({ children, className }) => {
                    const isBlock = className?.includes('language-');
                    return isBlock ? (
                        <code className="block bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre mb-4">{children}</code>
                    ) : (
                        <code className="bg-zinc-800 text-emerald-300 text-xs font-mono px-1.5 py-0.5 rounded">{children}</code>
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
                    <tr className="border-b border-white/5">{children}</tr>
                ),
                th: ({ children }) => (
                    <th className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider py-2 px-3 bg-zinc-800/60">{children}</th>
                ),
                td: ({ children }) => (
                    <td className="text-zinc-400 py-2.5 px-3 text-[13px]">{children}</td>
                ),
                hr: () => <hr className="border-white/5 my-8" />,
                img: ({ src, alt }) => {
                    const resolved = src && images[src] ? images[src] : src;
                    if (!resolved || (!images[src!] && !src?.startsWith('http'))) return null;

                    return (
                        <figure className="my-6">
                            <img
                                src={resolved}
                                alt={alt ?? ''}
                                className="w-full rounded-xl border border-white/10 object-cover"
                                loading="lazy"
                            />
                            {alt && <figcaption className="text-center text-xs text-zinc-600 mt-2">{alt}</figcaption>}
                        </figure>
                    );
                },
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">{children}</a>
                ),
            }}
        >
            {readme}
        </ReactMarkdown>
    );
}

function ScrollAmbientGlow() {
    const { scrollYProgress } = useScroll();

    // Slow, organic spring — lags deliberately behind scroll
    const spring = useSpring(scrollYProgress, { stiffness: 22, damping: 22, restDelta: 0.001 });

    // Fade in after hero, stay through page, dissolve near footer
    const opacity = useTransform(scrollYProgress, [0.06, 0.16, 0.88, 0.98], [0, 1, 1, 0]);

    // Blob 1 — large emerald, anchored top-right, drifts down-left with scroll
    const b1x = useTransform(spring, [0, 1], [100, -320]);
    const b1y = useTransform(spring, [0, 1], [-60, 460]);

    // Blob 2 — cyan, anchored bottom-left, drifts up-right with scroll
    const b2x = useTransform(spring, [0, 1], [-60, 360]);
    const b2y = useTransform(spring, [0, 1], [200, -280]);

    return (
        <motion.div
            style={{ opacity, zIndex: 1 }}
            className="fixed inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
        >
            {/* Primary glow — emerald */}
            <motion.div
                style={{
                    x: b1x,
                    y: b1y,
                    background: 'radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                className="absolute top-0 right-[6%] w-[680px] h-[680px] rounded-full"
            />
            {/* Secondary glow — cyan */}
            <motion.div
                style={{
                    x: b2x,
                    y: b2y,
                    background: 'radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 70%)',
                    filter: 'blur(90px)',
                }}
                className="absolute bottom-[18%] left-[4%] w-[500px] h-[500px] rounded-full"
            />
        </motion.div>
    );
}

export default function PortfolioEduardo() {
    const activeSection = useBehaviorTracking();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
    const [navShowPills, setNavShowPills] = useState(false);
    const sectionNavSentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const originalTitle = document.title;
        document.title = 'Eduardo Cornelsen — Data Analyst & Analytics Engineer Portfolio';
        return () => {
            document.title = originalTitle;
        };
    }, []);

    // Show pills inside desktop nav once user scrolls past the section nav sentinel
    useEffect(() => {
        const el = sectionNavSentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setNavShowPills(!entry.isIntersecting),
            { threshold: 0 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const { scrollYProgress } = useScroll();
    const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const progressWidth = useTransform(smoothScroll, [0, 1], ['0%', '100%']);
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const torusY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
    const aboutTextY = useTransform(scrollYProgress, [0.3, 0.5], [50, 0]);
    const aboutImageY = useTransform(scrollYProgress, [0.3, 0.5], [80, 0]);

    const navLink = (id: string, label: string) => (
        <a href={`#${id}`} className={`relative text-sm font-medium transition-colors duration-200 ${activeSection === id ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
            {label}
            {activeSection === id && (
                <motion.span layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-emerald-500 to-cyan-500" />
            )}
        </a>
    );

    return (
        <div className="bg-zinc-950 text-white min-h-screen">
            <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 z-[100] origin-left" style={{ width: progressWidth }} />

            <ScrollAmbientGlow />

            {/* ═══ NAVIGATION ═══ */}
            <nav id="main-nav" className="fixed top-0 w-full z-[90] border-b border-white/5 bg-zinc-950/85 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="#" className="flex items-center gap-2 group">
                        <span className="text-xl font-bold tracking-tight">
                            Eduardo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Cornelsen</span>
                        </span>
                    </a>

                    <div className="hidden md:flex items-center gap-2">
                        <AnimatePresence mode="wait" initial={false}>
                            {navShowPills ? (
                                <motion.div
                                    key="pills"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    {SECTION_LINKS.map(({ id, label }) => {
                                        const isActive = activeSection === id;
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => scrollToSection(id)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                                    isActive
                                                        ? 'text-black bg-emerald-500 shadow-md shadow-emerald-500/25'
                                                        : 'text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="links"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-8"
                                >
                                    {navLink('experience', 'Experience')}
                                    {navLink('projects', 'Projects')}
                                    {navLink('skills', 'Skills')}
                                    {navLink('viz', 'Data Viz')}
                                    {navLink('about', 'About')}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <a href="mailto:eduardo@eduardocornelsen.com" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Contact
                        </a>
                        <a 
                            href="https://github.com/eduardocornelsen/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                            onClick={() => trackEvent('Navigation', 'Click GitHub', 'Navbar')}
                        >
                            <span className="sr-only">GitHub</span>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                        </a>
                        <a 
                            href="https://linkedin.com/in/eduardo-cornelsen" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black font-semibold rounded-full hover:bg-emerald-400 transition-colors cursor-pointer text-sm"
                            onClick={() => trackEvent('Navigation', 'Click LinkedIn', 'Navbar')}
                        >
                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                        </a>
                    </div>

                    <div className="flex md:hidden items-center gap-2 relative z-[110]">
                        <a href="https://github.com/eduardocornelsen/" target="_blank" rel="noreferrer" className="flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                            <span className="sr-only">GitHub</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                        </a>
                        <button className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div key="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute top-full left-0 w-full md:hidden border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl overflow-hidden z-[130]">
                            <div className="flex flex-col items-center p-6 gap-5 text-base font-medium text-zinc-400 text-center">
                                {[['experience', 'Experience'], ['projects', 'Projects'], ['skills', 'Skills'], ['viz', "Data Viz"], ['about', 'About']].map(([id, label]) => (
                                    <button key={id} onClick={() => { setIsMenuOpen(false); setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150); }} className="text-left hover:text-white transition-colors cursor-pointer">
                                        {label}
                                    </button>
                                ))}
                                <a href="https://linkedin.com/in/eduardo-cornelsen" target="_blank" rel="noreferrer" className="w-full py-3.5 flex items-center justify-center gap-2 bg-emerald-500 text-black rounded-full text-center font-semibold hover:bg-emerald-400 transition-colors cursor-pointer">
                                    <Linkedin className="w-4 h-4"/> LinkedIn
                                </a>
                                <a 
                                    href="/Eduardo_Cornelsen_Data_Analyst_q2_2026.pdf" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-full py-3.5 flex items-center justify-center gap-2 bg-white/10 text-white rounded-full text-center font-semibold hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
                                    onClick={() => trackEvent('Mobile Menu', 'Download Resume', 'Mobile Nav')}
                                >
                                    <img src={downloadIcon} alt="" className="w-4 h-4 brightness-0 invert" />
                                    Resume
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="relative overflow-hidden min-h-screen flex flex-col">
                <motion.div style={{ y: torusY }} className="absolute inset-0 z-0 opacity-60">
                    <Suspense fallback={<TorusFallback />}>
                        <TorusField />
                    </Suspense>
                </motion.div>

                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.08)_0%,transparent_60%)]" />

                <div className="flex-1 flex items-center justify-center px-6 pt-24 md:pt-32 pb-20">
                    <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative z-10 w-full">
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mb-6 sm:mb-8 flex justify-center">
                            <img src={new URL('../assets/logos/Profile_compressed.webp', import.meta.url).href} alt="Eduardo Cornelsen" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-zinc-800 shadow-2xl object-cover" width="128" height="128" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-400 mb-6 sm:mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Open to Work · Data Analyst · Analytics Engineer
                        </motion.div>

                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }} className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4 sm:mb-6 leading-[0.88]">
                            Eduardo{' '}
                            <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300">
                                Cornelsen.
                            </span>
                        </motion.h1>


                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.8, delay: 0.35 }} 
                            className="text-lg md:text-2xl text-zinc-400 mb-10 sm:mb-12 max-w-4xl mx-auto leading-tight"
                        >
                            Most analytics teams build dashboards.
                            <div className="font-bold relative flex justify-center mt-3 h-[4em] sm:h-[1.5em] items-center text-xl sm:text-2xl md:text-3xl text-center px-4">
                                <TextTransition phrases={HERO_PHRASES} />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href="https://linkedin.com/in/eduardo-cornelsen" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 active:scale-95 transition-all text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                onClick={() => trackEvent('Hero', 'Click LinkedIn', 'Hero CTA')}
                            >
                                <Linkedin className="w-5 h-5"/> View LinkedIn
                            </a>
                            <a 
                                href="/Eduardo_Cornelsen_Data_Analyst_q2_2026.pdf" 
                                target="_blank" 
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2 text-base backdrop-blur-sm shadow-xl"
                                onClick={() => trackEvent('Hero', 'Download Resume', 'Hero CTA')}
                            >
                                <img src={downloadIcon} alt="" className="w-5 h-5 brightness-0 invert" />
                                Download Resume
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ SECTION NAV ═══ — mobile sticky bar; desktop gets pills injected into top nav */}
            {/* Sentinel: desktop nav IntersectionObserver watches this element */}
            <div ref={sectionNavSentinelRef} className="h-px" />
            <SectionNav activeSection={activeSection} visible={navShowPills} />

            {/* ═══ COMPANIES LOGOS ═══ */}
            <div className="w-full border-y border-white/5">
                {/* Tag/headline container — intentionally lighter to stand out */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="w-full py-5 bg-zinc-800/60 border-b border-white/8"
                >
                    <div className="max-w-7xl mx-auto text-center px-6">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.1 }}
                            className="text-[11px] md:text-sm font-black text-zinc-200 uppercase tracking-[0.4em]"
                        >
                            Revenue Analytics for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">SaaS, Fintech & E-Commerce</span>
                        </motion.p>
                    </div>
                </motion.div>
                <LogoMarquee logos={LOGOS_IMPACTED} mainLogos={LOGOS_MAIN} />
            </div>

            {/* ═══ IMPACT STATS ═══ */}
            <section className="py-20 px-6 relative overflow-hidden border-y border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-cyan-950/30" />
                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">1,000+</div>
                        <div className="text-sm md:text-base font-bold text-white">Client Diagnostics</div>
                        <div className="text-xs text-zinc-500">SMB & Enterprise sessions</div>
                    </div>
                    <div>
                        <div className="hidden md:block absolute left-1/4 top-1/2 -translate-y-1/2 w-px h-12 bg-white/5" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">~20%</div>
                        <div className="text-sm md:text-base font-bold text-white">Avg. CPA Reduction</div>
                        <div className="text-xs text-zinc-500">Via channel mix optimization</div>
                    </div>
                    <div>
                        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-12 bg-white/5" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">2h→10m</div>
                        <div className="text-sm md:text-base font-bold text-white">Reporting Automated</div>
                        <div className="text-xs text-zinc-500">Daily manual work eliminated</div>
                    </div>
                    <div>
                        <div className="hidden md:block absolute left-3/4 top-1/2 -translate-y-1/2 w-px h-12 bg-white/5" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums border-none">50h+</div>
                        <div className="text-sm md:text-base font-bold text-white">Hours Saved / Mo</div>
                        <div className="text-xs text-zinc-500">Via Python + n8n automation</div>
                    </div>
                </div>
            </section>

            {/* ═══ EXPERIENCE TIMELINE ═══ */}
            <section id="experience" className="py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                            Career Path
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Professional Experience</h2>
                    </motion.div>

                    <div className="relative border-l border-zinc-800 ml-4 md:ml-6 space-y-12 mt-10">
                        {EXPERIENCES.map((exp, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative pl-10 md:pl-14">
                                <div className={`absolute -left-[6px] top-1.5 w-3 h-3 rounded-full ring-4 ring-zinc-950 ${exp.badge ? 'border-2 border-emerald-500 bg-zinc-950' : 'bg-emerald-500'}`} />
                                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                                    <div className="mb-1 md:mb-0">
                                        <h3 className="text-xl font-bold text-white inline mr-2">{exp.role}</h3>
                                        {exp.badge && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 border border-teal-500/20 text-teal-400 align-middle">
                                                {exp.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-emerald-400 text-sm mt-1 md:mt-0 font-mono bg-emerald-500/10 px-2 py-0.5 rounded self-start">{exp.period}</span>
                                </div>
                                <div className="flex items-center gap-4 mb-4 mt-2">
                                    {exp.logo && (
                                        <img src={exp.logo} alt={exp.company} className={`${exp.company === 'Torus Analytics' ? 'h-14' : 'h-8'} w-auto max-w-[140px] object-contain brightness-0 invert opacity-60`} loading="lazy" width="140" height={exp.company === 'Torus Analytics' ? 56 : 32} />
                                    )}
                                    <div className="text-zinc-400 font-medium">{exp.company}</div>
                                </div>
                                {exp.intro && (
                                    <p className="text-zinc-400 text-sm italic mb-4 leading-relaxed">{exp.intro}</p>
                                )}
                                <ul className="space-y-2 text-zinc-400 text-sm">
                                    {exp.bullets.map((bullet, j) => (
                                        <li key={j} className="flex gap-2">
                                            <span className="text-zinc-600 mt-1">•</span>
                                            <span className="leading-relaxed">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PORTFOLIO PROJECTS ═══ */}
            <section id="projects" className="py-28 px-6 bg-zinc-900/30 border-y border-white/5 relative z-[2]">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                            Portfolio & Case Studies
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">End-to-End Projects</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-5 md:gap-x-8 max-w-4xl mx-auto">
                        {PROJECTS.map((proj, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 24 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                viewport={{ once: true, margin: '-40px' }} 
                                transition={{ duration: 0.5, delay: i * 0.08 }} 
                                whileHover={{ y: -6 }} 
                                onClick={() => {
                                    setSelectedProject(proj);
                                    trackEvent('Project', 'View Details', proj.title, { project_name: proj.title });
                                }} 
                                className="group relative p-px rounded-3xl cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${proj.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative bg-zinc-900 group-hover:bg-zinc-900/95 rounded-[calc(1.5rem-1px)] h-full flex flex-col transition-colors duration-300 overflow-hidden">
                                    <MediaCarousel media={proj.media} containerClasses={`w-full ${['PunkSQL', 'Full-Funnel AI Analytics Platform'].includes(proj.title) ? 'aspect-[9/16]' : 'aspect-video'} border-b border-white/5 bg-black`} />
                                    <div className="p-7 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${proj.gradient} bg-opacity-10 text-white/80 border border-white/10`}>
                                                {proj.outcome}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 transition-all">
                                            {proj.title}
                                        </h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed flex-1 mb-5">{proj.desc}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {proj.tags.map((tag, j) => {
                                                const logo = TECH_LOGOS[tag];
                                                return (
                                                    <span 
                                                        key={j} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            trackEvent('Project', 'Click Tag', tag, { tag_name: tag });
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                                                    >
                                                        {logo && <img src={logo} alt={tag} className="w-3 h-3 object-contain brightness-0 invert" />}
                                                        {tag}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-semibold opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                                            {proj.liveUrl && (
                                                <a 
                                                    href={proj.liveUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        trackEvent('Project', 'Click Live Demo', proj.title, { project_name: proj.title });
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-400 cursor-pointer whitespace-nowrap"
                                                >
                                                    <Zap className="w-3 h-3" />
                                                    {proj.title === 'PunkSQL' ? 'Play' : 'Live'}
                                                </a>
                                            )}
                                            {proj.presentationUrl && (
                                                <a 
                                                    href={proj.presentationUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        trackEvent('Project', 'Click Presentation', proj.title, { project_name: proj.title });
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-blue-400 cursor-pointer whitespace-nowrap"
                                                >
                                                    <BookOpen className="w-3 h-3" />
                                                    Slides
                                                </a>
                                            )}
                                            <a 
                                                href={proj.github} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    trackEvent('Project', 'Click GitHub', proj.title, { project_name: proj.title });
                                                }}
                                                className="text-zinc-400 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer p-1.5"
                                                title="View GitHub Repository"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                                            </a>
                                            <div className="flex items-center gap-1.5 px-2 py-1 whitespace-nowrap ml-auto">
                                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${proj.gradient}`}>View Details</span>
                                                <ArrowRight className="w-3 h-3 text-emerald-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SKILLS / TECH STACK ═══ */}
            <section id="skills" className="py-28 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                            Technical Skills
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">My Technical Arsenal</h2>
                        <p className="text-zinc-500 text-sm mt-3">Click any card to expand</p>
                    </motion.div>

                    <SkillsGrid />
                </div>
            </section>

            {/* ═══ DATA VIZ ═══ */}
            <div id="viz" className="relative z-[2]">
                <Suspense fallback={<div className="w-full h-96 bg-zinc-950/30 rounded-2xl animate-pulse" />}>
                    <DataVizShowcase />
                    <DashboardShowcase
                        subtitle="Live BI & Strategic Reporting"
                        title={<>Analytics Command Centers for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Every Sector</span></>}
                        description="Explore automated, real-time dashboards — mirroring the BI architectures developed for Torus Analytics and Mandalah."
                    />
                </Suspense>
            </div>

            {/* ═══ ABOUT / EDUCATION ═══ */}
            <section id="about" className="py-28 px-6 bg-zinc-900/50 border-y border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-16">

                    {/* ROW 1: Torus (left) + My Story headline (right) */}
                    <div className="grid xl:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            style={{ y: aboutImageY }}
                            initial={{ opacity: 0, scale: 0.85 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 1 }}
                            className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center order-last xl:order-first"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)] z-0" />
                            <div className="absolute inset-0 z-10">
                                <Suspense fallback={null}>
                                    <AboutTorus />
                                </Suspense>
                            </div>
                        </motion.div>

                        <motion.div
                            style={{ y: aboutTextY }}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6">
                                My Story
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                                I've sat in the revenue meetings.{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                    I know what the VP of Sales needs by Monday — and build the analytics to answer it before they ask.
                                </span>
                            </h2>
                        </motion.div>
                    </div>

                    {/* ROW 2: Body text (left) + Credential cards (right) */}
                    <div className="grid xl:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 text-zinc-400 text-base lg:text-[19.8px] leading-loose lg:text-right"
                        >
                            <p>
                                Over 9 years, I went from closing deals at <span className="text-white font-medium">Omie</span> — Brazil's leading cloud ERP — to strategic consulting and now <span className="text-white font-medium">Data Analytics</span>: diagnosing where <span className="text-white font-medium">SaaS, E-Commerce, and Fintech</span> firms lose revenue, and building the infrastructure to capture it.
                            </p>
                            <p>
                                Because I've sat in the revenue meetings, I don't just write queries or build pipelines — I understand the <span className="text-white font-medium">business problem behind the ticket</span>. As <span className="text-white font-medium">BI Lead at Torus Analytics</span>, I've architected reporting for dozens of <span className="text-white font-medium">SMB and enterprise</span> operations. Now, through my residency at <span className="text-white font-medium">TripleTen</span>, I'm deepening expertise in <span className="text-white font-medium">ML, predictive modeling, and AI Agents</span>.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 group/edu transition-all hover:border-emerald-500/30">
                                <a 
                                    href="https://www.insper.edu.br/en/home" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between mb-3 cursor-pointer group/link"
                                >
                                    <img
                                        src={insperLogo}
                                        alt="Insper"
                                        className="h-6 w-auto object-contain brightness-0 invert opacity-80 group-hover/edu:opacity-100 group-hover/link:scale-105 transition-all"
                                        width="120" height="24"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <GraduationCap className="w-5 h-5 text-emerald-400 hidden group-hover/link:scale-110 transition-transform"/>
                                </a>
                                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1 uppercase">INSPER (São Paulo)</div>
                                <div className="text-sm font-semibold text-white">Bachelor of Business Administration (BBA)</div>
                                <div className="text-xs text-zinc-400 italic mt-2">#1 Brazilian business school · Triple Accredited (AACSB, AMBA, EQUIS)</div>
                            </div>

                            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 group/edu transition-all hover:border-cyan-500/30">
                                <a 
                                    href="https://international.au.dk/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between mb-3 cursor-pointer group/link"
                                >
                                    <img
                                        src={aarhusLogo}
                                        alt="Aarhus University"
                                        className="h-6 w-auto object-contain brightness-0 invert opacity-80 group-hover/edu:opacity-100 group-hover/link:scale-105 transition-all"
                                        width="120" height="24"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <GraduationCap className="w-5 h-5 text-cyan-400 hidden group-hover/link:scale-110 transition-transform"/>
                                </a>
                                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1 uppercase">AARHUS UNIV. (Denmark)</div>
                                <div className="text-sm font-semibold text-white">Exchange Program, Innovation & Global Business</div>
                                <div className="text-xs text-zinc-400 italic mt-2">Triple Accredited Business School (AACSB, AMBA, EQUIS)</div>
                            </div>

                            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 group/edu transition-all hover:border-violet-500/30">
                                <a 
                                    href="https://d-lab.mit.edu/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between mb-3 cursor-pointer group/link"
                                >
                                    <img
                                        src={mitLogo}
                                        alt="MIT"
                                        className="h-6 w-auto object-contain brightness-0 invert opacity-80 group-hover/edu:opacity-100 group-hover/link:scale-105 transition-all"
                                        width="80" height="24"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <Sparkles className="w-5 h-5 text-violet-400 hidden group-hover/link:scale-110 transition-transform"/>
                                </a>
                                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1 uppercase">MIT / D-Lab (Boston)</div>
                                <div className="text-sm font-semibold text-white">MIT Innovation Award — Best Project</div>
                                <div className="text-xs text-zinc-400 italic mt-2">Presented to MIT Master's & PhD panel · "Transformation Engineering"</div>
                            </div>

                            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 group/edu transition-all hover:border-amber-500/30">
                                <a 
                                    href="https://falconi.com/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between mb-3 cursor-pointer group/link"
                                >
                                    <img
                                        src={sixSigmaLogo}
                                        alt="Lean Six Sigma"
                                        className="h-6 w-auto object-contain brightness-0 invert opacity-80 group-hover/edu:opacity-100 group-hover/link:scale-105 transition-all"
                                        width="120" height="24"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <BookOpen className="w-5 h-5 text-amber-400 hidden group-hover/link:scale-110 transition-transform"/>
                                </a>
                                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1 uppercase">CERTIFICATION</div>
                                <div className="text-sm font-semibold text-white">Lean Six Sigma Green Belt (Falconi)</div>
                                <div className="text-xs text-zinc-400 italic mt-2">Falconi · Lean Six Sigma Green Belt</div>
                            </div>

                            {/* Card 5 — Databricks */}
                            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 group/edu transition-all hover:border-orange-500/30">
                                <a
                                    href="https://www.databricks.com/learn/certification"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between mb-3 cursor-pointer group/link"
                                >
                                    <img
                                        src={databricksLogo}
                                        alt="Databricks"
                                        className="h-6 w-auto object-contain brightness-0 invert opacity-80 group-hover/edu:opacity-100 group-hover/link:scale-105 transition-all"
                                        width="120" height="24"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <BookOpen className="w-5 h-5 text-orange-400 hidden group-hover/link:scale-110 transition-transform"/>
                                </a>
                                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1 uppercase">CERTIFICATION</div>
                                <div className="text-sm font-semibold text-white">Databricks Fundamentals & AI Agent Fundamentals</div>
                                <div className="text-xs text-zinc-400 italic mt-2">Issued April 2026 · Medallion Architecture · AI Agents · MCP & AI Integration · Azure Databricks</div>
                            </div>

                            {/* Card 6 — Epic Games */}
                            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 group/edu transition-all hover:border-zinc-400/30">
                                <a
                                    href="https://store.epicgames.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between mb-3 cursor-pointer group/link"
                                >
                                    <img
                                        src={epicGamesLogo}
                                        alt="Epic Games"
                                        className="h-6 w-auto object-contain brightness-0 invert opacity-80 group-hover/edu:opacity-100 group-hover/link:scale-105 transition-all"
                                        width="120" height="24"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                    />
                                    <TrendingUp className="w-5 h-5 text-zinc-300 hidden group-hover/link:scale-110 transition-transform"/>
                                </a>
                                <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1 uppercase">ACHIEVEMENT</div>
                                <div className="text-sm font-semibold text-white">Epic Games Data Analyst — Final Round</div>
                                <div className="text-xs text-zinc-400 italic mt-2">Final round at Epic Games UX Research Data Analyst role, Feb 2026</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══ PROJECT MODAL ═══ */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-start justify-center p-4 sm:p-6 py-8 md:py-14 overflow-y-auto"
                        onClick={() => setSelectedProject(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="bg-zinc-900 rounded-3xl max-w-4xl w-full overflow-hidden border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Media header */}
                            <div className="relative overflow-hidden group">
                                <MediaCarousel media={selectedProject.media} containerClasses="h-64 sm:h-80 w-full bg-black/50" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent pointer-events-none" />
                                <button onClick={(e) => { e.stopPropagation(); setSelectedProject(null); }} className="absolute z-30 top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer backdrop-blur-sm">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                                <div className="absolute bottom-4 right-4 z-30 pointer-events-none">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${selectedProject.gradient} text-white shadow-lg`}>
                                        {selectedProject.outcome}
                                    </span>
                                </div>
                            </div>

                            {/* Header: title + tags + desc + CTAs */}
                            <div className="px-8 pt-8 pb-6 border-b border-white/5">
                                <h3 className="text-2xl font-bold mb-3">{selectedProject.title}</h3>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {selectedProject.tags.map((tag, j) => {
                                        const logo = TECH_LOGOS[tag];
                                        return (
                                            <span key={j} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold bg-white/10 border border-white/10 text-zinc-200">
                                                {logo && <img src={logo} alt={tag} className="w-3.5 h-3.5 object-contain brightness-0 invert" />}
                                                {tag}
                                            </span>
                                        );
                                    })}
                                </div>
                                <p className="text-zinc-400 leading-relaxed mb-7 text-[15px] mt-5">{selectedProject.desc}</p>
                                <div className="flex flex-wrap gap-3">
                                    {selectedProject.liveUrl && (
                                        <a 
                                            href={selectedProject.liveUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex-1 min-w-[160px] px-5 py-2.5 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 text-sm order-1"
                                            onClick={() => trackEvent('Project Modal', 'Click Live Demo', selectedProject.title, { project_name: selectedProject.title })}
                                        >
                                            <Zap className="w-4 h-4" />
                                            {selectedProject.title === 'PunkSQL' ? 'Play' : 'Live Demo'}
                                        </a>
                                    )}
                                    <a 
                                        href={selectedProject.github} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="flex-1 min-w-[160px] px-5 py-2.5 bg-zinc-800 text-white font-semibold rounded-full hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10 text-sm order-2"
                                        onClick={() => trackEvent('Project Modal', 'Click GitHub', selectedProject.title, { project_name: selectedProject.title })}
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                                        GitHub
                                    </a>
                                    {selectedProject.presentationUrl && (
                                        <a 
                                            href={selectedProject.presentationUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex-1 min-w-[160px] px-5 py-2.5 bg-zinc-100 text-black font-bold rounded-full hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm order-3"
                                            onClick={() => trackEvent('Project Modal', 'Click Presentation', selectedProject.title, { project_name: selectedProject.title })}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Presentation
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Case study body */}
                            {selectedProject.readme && (
                                <ModalCaseStudy readme={selectedProject.readme} images={selectedProject.images ?? {}} gradient={selectedProject.gradient} />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ FOOTER ═══ */}
            <footer className="pt-24 pb-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,185,129,0.06)_0%,transparent_70%)] z-[1]" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-6 flex justify-center">
                        <img src={new URL('../assets/logos/Profile_compressed.webp', import.meta.url).href} alt="Eduardo Cornelsen" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-zinc-800 shadow-xl object-cover" loading="lazy" width="96" height="96" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8">
                        Let's connect
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
                        If your revenue data raises more questions than it answers — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">let's talk.</span>
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="text-zinc-500 text-sm mb-2">
                        Available for Data Analyst & Analytics Engineering roles. I respond within 24 hours.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <a 
                            href="https://linkedin.com/in/eduardo-cornelsen" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 active:scale-95 transition-all text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            onClick={() => trackEvent('Footer', 'Click LinkedIn', 'Footer CTA')}
                        >
                            <Linkedin className="w-5 h-5"/> LinkedIn
                        </a>
                        <a 
                            href="mailto:eduardo@eduardocornelsen.com" 
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                            onClick={() => trackEvent('Contact', 'Click Email', 'Footer')}
                        >
                            <Mail className="w-4 h-4" /> eduardo@eduardocornelsen.com
                        </a>
                    </motion.div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/8 max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-bold">
                                Eduardo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Cornelsen</span>
                            </span>
                        </div>
                        <p className="text-zinc-700 text-xs">&copy; {new Date().getFullYear()} Eduardo Cornelsen. Built with React & Tailwind.</p>
                    </div>
                </div>
            </footer>
            <Chatbot navVisible={navShowPills} />
        </div>
    );
}
