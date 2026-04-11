import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { trackEvent } from '../utils/analytics';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Minus, Activity, Network, BarChart2, Table2, Zap, GitMerge } from 'lucide-react';

// ─── Shared colours ────────────────────────────────────────────────────────────
const EMERALD = '#10b981';
const CYAN = '#06b6d4';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const ROSE = '#f43f5e';

// ─── Utility: deterministic fake data ──────────────────────────────────────────
function makeRevenueData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let r = 420, c = 310, p = 180;
    return months.map((m, i) => {
        r = +(r + (Math.sin(i * 0.7) * 40 + 15)).toFixed(0);
        c = +(c + (Math.sin(i * 0.5) * 30 + 10)).toFixed(0);
        p = +(p + (Math.sin(i * 0.9) * 20 + 8)).toFixed(0);
        return { month: m, revenue: r, conversions: c, pipeline: p };
    });
}

function makeKpiData() {
    return [
        { label: 'Avg Deal Value', value: '$142K', delta: '+18%', up: true, color: EMERALD },
        { label: 'Win Rate', value: '68.4%', delta: '+5.2%', up: true, color: CYAN },
        { label: 'CAC', value: '$3,210', delta: '-12%', up: true, color: VIOLET },
        { label: 'LTV / CAC', value: '4.7×', delta: '+0.8', up: true, color: AMBER },
        { label: 'Churn Rate', value: '1.8%', delta: '-0.4%', up: true, color: EMERALD },
        { label: 'NPS Score', value: '72', delta: '+11', up: true, color: CYAN },
    ];
}

function makeTableData() {
    const regions = ['Brazil', 'LATAM', 'US', 'Europe', 'Asia'];
    return regions.map((r, i) => ({
        region: r,
        q1: +(200 + i * 40 + Math.random() * 60).toFixed(0),
        q2: +(220 + i * 45 + Math.random() * 60).toFixed(0),
        q3: +(250 + i * 50 + Math.random() * 60).toFixed(0),
        q4: +(280 + i * 55 + Math.random() * 60).toFixed(0),
        trend: (Math.random() > 0.2) ? 'up' : 'down',
        yoy: `+${(12 + i * 3 + Math.random() * 8).toFixed(1)}%`,
        spark: Array.from({ length: 8 }, (_, k) => +(100 + k * 15 + i * 20 + Math.random() * 30).toFixed(0)),
    }));
}

const REVENUE_DATA = makeRevenueData();
const KPI_DATA = makeKpiData();
const TABLE_DATA = makeTableData();

const TABS = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity },
    { id: 'network', label: 'Network Graph', icon: Network },
    { id: 'predictive', label: 'Predictive Models', icon: BarChart2 },
    { id: 'table', label: 'Advanced Table', icon: Table2 },
    { id: 'stream', label: 'Real-Time Stream', icon: Zap },
    { id: 'sankey', label: 'Revenue Flow', icon: GitMerge },
];

// ─── Seed for stream ────────────────────────────────────────────────────────────
function makeStreamSeed() {
    return Array.from({ length: 60 }, (_, i) => ({
        t: i,
        revenue: +(380 + Math.sin(i * 0.22) * 90 + Math.random() * 35).toFixed(1),
        anomaly: +(30 + Math.sin(i * 0.31) * 15 + Math.random() * 12).toFixed(1),
        latency: +(42 + Math.sin(i * 0.18) * 18 + Math.random() * 10).toFixed(1),
    }));
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
            <p className="text-zinc-400 mb-2 font-semibold">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-zinc-300">{p.name}:</span>
                    <span className="text-white font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = EMERALD }: { data: number[]; color?: string }) {
    const w = 80, h = 28;
    const min = Math.min(...data), max = Math.max(...data);
    const xs = data.map((_, i) => (i / (data.length - 1)) * w);
    const ys = data.map(v => h - ((v - min) / (max - min || 1)) * h);
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
    const area = `${path} L${w},${h} L0,${h} Z`;
    return (
        <svg width={w} height={h} className="shrink-0">
            <defs>
                <linearGradient id={`sg${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#sg${color.replace('#', '')})`} />
            <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
        </svg>
    );
}

// ─── D3 Force Network ────────────────────────────────────────────────────────────
function ForceNetwork({ width, height }: { width: number; height: number }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || width < 100) return;

        const nodes: any[] = [
            { id: 'CRM', group: 0, size: 28, label: 'CRM' },
            { id: 'DataLake', group: 1, size: 34, label: 'Data Lake' },
            { id: 'ML Engine', group: 1, size: 30, label: 'ML Engine' },
            { id: 'Dashboard', group: 2, size: 26, label: 'Dashboard' },
            { id: 'Alerts', group: 2, size: 22, label: 'Alerts' },
            { id: 'Revenue', group: 3, size: 36, label: 'Revenue' },
            { id: 'Marketing', group: 0, size: 24, label: 'Marketing' },
            { id: 'Ops', group: 0, size: 22, label: 'Ops' },
            { id: 'Forecasts', group: 3, size: 26, label: 'Forecasts' },
            { id: 'LLM Agent', group: 1, size: 28, label: 'LLM Agent' },
        ];
        const links: any[] = [
            { source: 'CRM', target: 'DataLake', value: 5 },
            { source: 'Marketing', target: 'DataLake', value: 4 },
            { source: 'Ops', target: 'DataLake', value: 3 },
            { source: 'DataLake', target: 'ML Engine', value: 6 },
            { source: 'DataLake', target: 'LLM Agent', value: 5 },
            { source: 'ML Engine', target: 'Forecasts', value: 5 },
            { source: 'ML Engine', target: 'Dashboard', value: 4 },
            { source: 'LLM Agent', target: 'Alerts', value: 4 },
            { source: 'LLM Agent', target: 'Dashboard', value: 3 },
            { source: 'Dashboard', target: 'Revenue', value: 6 },
            { source: 'Forecasts', target: 'Revenue', value: 5 },
            { source: 'Alerts', target: 'CRM', value: 3 },
        ];

        const colors = [EMERALD, CYAN, VIOLET, AMBER];

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Defs
        const defs = svg.append('defs');
        colors.forEach((c, i) => {
            const g = defs.append('radialGradient').attr('id', `ng${i}`);
            g.append('stop').attr('offset', '0%').attr('stop-color', c).attr('stop-opacity', '0.9');
            g.append('stop').attr('offset', '100%').attr('stop-color', c).attr('stop-opacity', '0.4');
        });

        const sim = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id((d: any) => d.id).distance(90).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-260))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius((d: any) => d.size + 16));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', 'rgba(255,255,255,0.12)')
            .attr('stroke-width', (d: any) => Math.sqrt(d.value))
            .attr('stroke-dasharray', '4 3');

        const nodeG = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .call(
                d3.drag<any, any>()
                    .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
                    .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
                    .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
            );

        // Glow circle
        nodeG.append('circle')
            .attr('r', (d: any) => d.size + 8)
            .attr('fill', (d: any) => colors[d.group])
            .attr('opacity', 0.1);

        // Main circle
        nodeG.append('circle')
            .attr('r', (d: any) => d.size)
            .attr('fill', (d: any) => `url(#ng${d.group})`)
            .attr('stroke', (d: any) => colors[d.group])
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.6);

        // Label
        nodeG.append('text')
            .text((d: any) => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .attr('font-size', 10)
            .attr('font-weight', '600')
            .attr('font-family', 'system-ui,sans-serif')
            .attr('pointer-events', 'none');

        // Animated packet dots
        function animatePacket(linkDatum: any) {
            const srcNode = nodes.find(n => n.id === linkDatum.source.id || n.id === linkDatum.source);
            const tgtNode = nodes.find(n => n.id === linkDatum.target.id || n.id === linkDatum.target);
            if (!srcNode || !tgtNode) return;
            const dot = svg.append('circle')
                .attr('r', 3)
                .attr('fill', EMERALD)
                .attr('opacity', 0.9);
            dot.transition().duration(1200)
                .attrTween('cx', () => { const i = d3.interpolateNumber(srcNode.x, tgtNode.x); return (t: number) => String(i(t)); })
                .attrTween('cy', () => { const i = d3.interpolateNumber(srcNode.y, tgtNode.y); return (t: number) => String(i(t)); })
                .on('end', () => dot.remove());
        }

        let packetInterval: any;
        sim.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
            nodeG.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        sim.on('end', () => {
            packetInterval = setInterval(() => {
                const l = links[Math.floor(Math.random() * links.length)];
                animatePacket(l);
            }, 400);
        });

        return () => { sim.stop(); clearInterval(packetInterval); };
    }, [width, height]);

    return <svg ref={svgRef} width={width} height={height} className="w-full h-full" />;
}

// ─── Plotly 3D Surface via CDN ───────────────────────────────────────────────────
declare global { interface Window { Plotly: any } }

function PlotlySurface() {
    const divRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        function init() {
            if (!divRef.current || !window.Plotly) return;
            const size = 40;
            const z: number[][] = Array.from({ length: size }, (_, i) =>
                Array.from({ length: size }, (_, j) => {
                    const x = (i - size / 2) / 5, y = (j - size / 2) / 5;
                    return Math.sin(Math.sqrt(x * x + y * y)) * Math.exp(-0.05 * (x * x + y * y)) * 6;
                })
            );
            const z2: number[][] = Array.from({ length: size }, (_, i) =>
                Array.from({ length: size }, (_, j) => {
                    const x = (i - size / 2) / 8, y = (j - size / 2) / 8;
                    return Math.cos(x) * Math.sin(y) * 4 - 3;
                })
            );
            window.Plotly.newPlot(divRef.current, [
                {
                    type: 'surface', z, name: 'Model A',
                    colorscale: [['0', '#064e3b'], ['0.5', '#10b981'], ['1', '#6ee7b7']],
                    showscale: false, opacity: 0.9,
                    contours: { z: { show: true, usecolormap: true, highlightcolor: '#6ee7b7', project: { z: true } } }
                },
                {
                    type: 'surface', z: z2, name: 'Model B',
                    colorscale: [['0', '#1e1b4b'], ['0.5', '#8b5cf6'], ['1', '#c4b5fd']],
                    showscale: false, opacity: 0.6,
                }
            ], {
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                margin: { l: 0, r: 0, t: 0, b: 0 },
                scene: {
                    bgcolor: 'transparent',
                    xaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: false, showticklabels: false },
                    yaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: false, showticklabels: false },
                    zaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.07)', zeroline: false, showticklabels: false },
                    camera: { eye: { x: 1.4, y: 1.4, z: 0.9 } }
                }
            }, { displayModeBar: false, responsive: true });
            setLoaded(true);
        }

        if (window.Plotly) { init(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.plot.ly/plotly-3.0.1.min.js';
        s.onload = init;
        document.head.appendChild(s);
    }, []);

    return (
        <div className="relative w-full h-full">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-zinc-400 text-sm">Loading 3D surface...</span>
                    </div>
                </div>
            )}
            <div ref={divRef} className="w-full h-full" />
        </div>
    );
}

// ─── Plotly Sankey ───────────────────────────────────────────────────────────────
function PlotlySankey() {
    const divRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const init = () => {
            if (!divRef.current || !(window as any).Plotly) return;
            const Plotly = (window as any).Plotly;
            const labels = ['CRM', 'Marketing', 'Ops Data', 'Data Lake', 'ML Engine', 'LLM Agent', 'Dashboard', 'Alerts', 'Revenue'];
            const nodeColors = [EMERALD, EMERALD, EMERALD, CYAN, VIOLET, VIOLET, AMBER, ROSE, '#22c55e'];
            Plotly.react(divRef.current, [{
                type: 'sankey',
                orientation: 'h',
                arrangement: 'snap',
                node: {
                    pad: 20, thickness: 24,
                    line: { color: 'rgba(255,255,255,0.08)', width: 1 },
                    label: labels,
                    color: nodeColors,
                    hovertemplate: '<b>%{label}</b><br>Flow: %{value}<extra></extra>',
                },
                link: {
                    source: [0, 1, 2, 3, 3, 4, 5, 4, 5, 6, 7, 8],
                    target: [3, 3, 3, 4, 5, 6, 6, 7, 7, 8, 8, 3],
                    value: [8, 6, 4, 9, 7, 5, 4, 6, 5, 7, 6, 3],
                    color: [
                        'rgba(16,185,129,0.18)', 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0.12)',
                        'rgba(6,182,212,0.2)', 'rgba(6,182,212,0.18)',
                        'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.15)',
                        'rgba(244,63,94,0.18)', 'rgba(244,63,94,0.15)',
                        'rgba(245,158,11,0.22)', 'rgba(245,158,11,0.18)',
                        'rgba(16,185,129,0.1)',
                    ],
                    hovertemplate: '%{source.label} → %{target.label}<br>Volume: %{value}<extra></extra>',
                },
            }], {
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                margin: { l: 10, r: 10, t: 10, b: 10 },
                font: { color: '#a1a1aa', size: 11, family: 'Inter, sans-serif' },
            }, { responsive: true, displayModeBar: false });
            setLoaded(true);
        };

        if ((window as any).Plotly) { init(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.plot.ly/plotly-3.0.1.min.js';
        s.onload = init;
        document.head.appendChild(s);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[380px]">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-zinc-400 text-sm">Building flow diagram...</span>
                    </div>
                </div>
            )}
            <div ref={divRef} className="w-full h-full" />
        </div>
    );
}

// ─── Heatmap cell colour ─────────────────────────────────────────────────────────
function heatColor(v: number, min: number, max: number) {
    const t = (v - min) / (max - min);
    if (t < 0.33) return `rgba(239,68,68,${0.15 + t * 0.5})`;
    if (t < 0.66) return `rgba(245,158,11,${0.15 + t * 0.4})`;
    return `rgba(16,185,129,${0.15 + t * 0.5})`;
}

// ─── Main Component ──────────────────────────────────────────────────────────────
export default function DataVizShowcase() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [ticker, setTicker] = useState(0);
    const [netSize, setNetSize] = useState({ w: 600, h: 420 });
    const netRef = useRef<HTMLDivElement>(null);
    const [tableSort, setTableSort] = useState<{ col: string, dir: 1 | -1 }>({ col: 'q4', dir: -1 });
    const [streamData, setStreamData] = useState(makeStreamSeed);
    const streamTickRef = useRef(60);

    // Animated ticker for live feel
    useEffect(() => {
        const t = setInterval(() => setTicker(x => x + 1), 1800);
        return () => clearInterval(t);
    }, []);

    // Real-time stream: add a data point every 400ms when tab is active
    useEffect(() => {
        if (activeTab !== 'stream') return;
        const t = setInterval(() => {
            const i = streamTickRef.current++;
            setStreamData(prev => [...prev.slice(1), {
                t: i,
                revenue: +(380 + Math.sin(i * 0.22) * 90 + Math.random() * 35).toFixed(1),
                anomaly: +(30 + Math.sin(i * 0.31) * 15 + Math.random() * 12).toFixed(1),
                latency: +(42 + Math.sin(i * 0.18) * 18 + Math.random() * 10).toFixed(1),
            }]);
        }, 400);
        return () => clearInterval(t);
    }, [activeTab]);

    // Measure network container
    useEffect(() => {
        if (!netRef.current) return;
        const ro = new ResizeObserver(([e]) => {
            setNetSize({ w: e.contentRect.width, h: e.contentRect.height || 420 });
        });
        ro.observe(netRef.current);
        return () => ro.disconnect();
    }, []);

    // Live ticking KPI adjustment
    const liveKpi = KPI_DATA.map((k, i) => ({
        ...k,
        value: i === 0 ? `$${(142 + Math.sin(ticker * 0.4 + i) * 4).toFixed(0)}K`
            : i === 1 ? `${(68.4 + Math.sin(ticker * 0.3 + i) * 1.2).toFixed(1)}%`
                : k.value,
    }));

    const sortedTable = [...TABLE_DATA].sort((a: any, b: any) => {
        const av = a[tableSort.col], bv = b[tableSort.col];
        return typeof av === 'number' ? (av - bv) * tableSort.dir : String(av).localeCompare(String(bv)) * tableSort.dir;
    });

    const allVals = TABLE_DATA.flatMap(r => [r.q1, r.q2, r.q3, r.q4]);
    const minV = Math.min(...allVals), maxV = Math.max(...allVals);

    const thCls = 'px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-emerald-400 transition-colors select-none';
    const tdCls = 'px-4 py-3 text-sm text-zinc-200';

    function sortBy(col: string) {
        trackEvent('DataViz', 'Sort Table', col, { sort_column: col });
        setTableSort(s => s.col === col ? { col, dir: (s.dir * -1) as 1 | -1 } : { col, dir: -1 });
    }

    const gradId = useCallback((name: string) => `grad-${name.replace(/\s/g, '')}`, []);

    return (
        <section className="py-24 px-6 bg-zinc-950 border-y border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Interactive Demos
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        See What's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Possible</span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Real-time dashboards, AI network graphs, 3D predictive surfaces, and intelligent data tables — production-grade, always on.
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                trackEvent('DataViz', 'Switch Tab', tab.id, { viz_type: tab.id });
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === tab.id
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                : 'bg-zinc-900 text-zinc-400 border border-white/8 hover:border-emerald-500/30 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Panel */}
                <AnimatePresence mode="wait">

                    {/* ── TAB 1: Dashboard ── */}
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* KPI row */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                                {liveKpi.map((k, i) => (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                        className="bg-zinc-900 border border-white/5 rounded-2xl p-4 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: k.color }} />
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{k.label}</div>
                                        <div className="text-xl font-bold text-white tabular-nums">{k.value}</div>
                                        <div className={`flex items-center gap-1 text-xs mt-1 font-semibold ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {k.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {k.delta} <span className="text-zinc-600">YoY</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Charts row */}
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Revenue multi-area */}
                                <div className="md:col-span-2 bg-zinc-900 border border-white/5 rounded-3xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-sm font-bold text-white">Revenue & Pipeline</div>
                                            <div className="text-xs text-zinc-500">Trailing 12 months</div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-emerald-400 font-bold">LIVE</span>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id={gradId('rev')} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={EMERALD} stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id={gradId('pipe')} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={VIOLET} stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id={gradId('conv')} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={CYAN} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                                            <Area type="monotone" dataKey="revenue" name="Revenue ($K)" stroke={EMERALD} fill={`url(#${gradId('rev')})`} strokeWidth={2} />
                                            <Area type="monotone" dataKey="pipeline" name="Pipeline ($K)" stroke={VIOLET} fill={`url(#${gradId('pipe')})`} strokeWidth={2} />
                                            <Area type="monotone" dataKey="conversions" name="Conversions ($K)" stroke={CYAN} fill={`url(#${gradId('conv')})`} strokeWidth={2} strokeDasharray="4 2" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Bar chart — quarterly */}
                                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                                    <div className="text-sm font-bold text-white mb-1">Quarterly Wins</div>
                                    <div className="text-xs text-zinc-500 mb-4">Deals closed per region</div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={[
                                            { q: 'Q1', BR: 34, LATAM: 22, US: 41 },
                                            { q: 'Q2', BR: 38, LATAM: 27, US: 48 },
                                            { q: 'Q3', BR: 42, LATAM: 31, US: 55 },
                                            { q: 'Q4', BR: 51, LATAM: 38, US: 63 },
                                        ]} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="q" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                                            <Bar dataKey="BR" name="Brazil" fill={EMERALD} radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="LATAM" name="LATAM" fill={CYAN} radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="US" name="US" fill={VIOLET} radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── TAB 2: Network Graph ── */}
                    {activeTab === 'network' && (
                        <motion.div key="network"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                            className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">AI Data Flow Network</div>
                                    <div className="text-xs text-zinc-500">Live packet animation — drag any node to reshape the graph</div>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    {[{ label: 'Systems', color: EMERALD }, { label: 'Intelligence', color: CYAN }, { label: 'Outputs', color: VIOLET }, { label: 'Revenue', color: AMBER }].map(l => (
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                                            <span className="text-zinc-400">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div ref={netRef} className="w-full" style={{ height: 420 }}>
                                <ForceNetwork width={netSize.w} height={netSize.h} />
                            </div>
                        </motion.div>
                    )}

                    {/* ── TAB 3: Predictive Surface ── */}
                    {activeTab === 'predictive' && (
                        <motion.div key="predictive"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
                                    <div className="p-5 border-b border-white/5">
                                        <div className="text-sm font-bold text-white">3D Predictive Surface — ML Model Comparison</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">Powered by Plotly.js · Rotate &amp; zoom the surface</div>
                                    </div>
                                    <div style={{ height: 380 }}>
                                        <PlotlySurface />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {/* Metric panels */}
                                    {[
                                        { label: 'Model A — Accuracy', value: '94.7%', delta: '+2.3%', color: EMERALD, desc: 'XGBoost ensemble on 14M rows' },
                                        { label: 'Model B — Accuracy', value: '91.2%', delta: '+1.1%', color: VIOLET, desc: 'Deep neural net, 128 features' },
                                        { label: 'Inference Time', value: '18ms', delta: '-6ms', color: CYAN, desc: 'P99 latency, production env' },
                                    ].map((m, i) => (
                                        <div key={i} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex-1">
                                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: m.color }} />
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{m.label}</div>
                                            <div className="text-3xl font-black text-white mb-1">{m.value}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />{m.delta}
                                                </span>
                                                <span className="text-zinc-600 text-xs">{m.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Mini line chart */}
                                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 flex-1">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Model Accuracy Over Training</div>
                                        <ResponsiveContainer width="100%" height={100}>
                                            <LineChart data={Array.from({ length: 20 }, (_, i) => ({
                                                e: i, a: 60 + i * 1.8 + Math.sin(i) * 3, b: 55 + i * 1.7 + Math.cos(i) * 4
                                            }))}>
                                                <Line type="monotone" dataKey="a" name="Model A" stroke={EMERALD} dot={false} strokeWidth={2} />
                                                <Line type="monotone" dataKey="b" name="Model B" stroke={VIOLET} dot={false} strokeWidth={2} />
                                                <Tooltip content={<CustomTooltip />} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── TAB 4: Advanced Table ── */}
                    {activeTab === 'table' && (
                        <motion.div key="table"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                            className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">Revenue Intelligence Table</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">Click column headers to sort · Heatmap cells · Embedded sparklines</div>
                                </div>
                                <div className="flex gap-3 text-[10px]">
                                    {[{ label: 'Low', c: 'rgba(239,68,68,0.4)' }, { label: 'Mid', c: 'rgba(245,158,11,0.4)' }, { label: 'High', c: 'rgba(16,185,129,0.4)' }].map(l => (
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded" style={{ background: l.c }} />
                                            <span className="text-zinc-500">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-white/5">
                                        <tr>
                                            {[
                                                { key: 'region', label: 'Region' },
                                                { key: 'q1', label: 'Q1 ($K)' },
                                                { key: 'q2', label: 'Q2 ($K)' },
                                                { key: 'q3', label: 'Q3 ($K)' },
                                                { key: 'q4', label: 'Q4 ($K)' },
                                                { key: 'trend', label: 'Trend' },
                                                { key: 'yoy', label: 'YoY' },
                                                { key: 'spark', label: '8Q Sparkline' },
                                            ].map(col => (
                                                <th key={col.key} className={thCls} onClick={() => col.key !== 'spark' && sortBy(col.key)}>
                                                    {col.label}
                                                    {tableSort.col === col.key && (
                                                        <span className="ml-1">{tableSort.dir === -1 ? '↓' : '↑'}</span>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTable.map((row, i) => (
                                            <tr key={row.region} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className={tdCls + ' font-semibold text-white'}>{row.region}</td>
                                                {([row.q1, row.q2, row.q3, row.q4] as number[]).map((v, qi) => (
                                                    <td key={qi} className="px-4 py-3 text-sm font-mono tabular-nums text-right">
                                                        <span className="inline-block px-2 py-1 rounded-lg font-bold text-white"
                                                            style={{ background: heatColor(v, minV, maxV) }}
                                                        >{v}</span>
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3">
                                                    {row.trend === 'up'
                                                        ? <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><TrendingUp className="w-3.5 h-3.5" />Rising</span>
                                                        : <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><TrendingDown className="w-3.5 h-3.5" />Falling</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-emerald-400 font-bold text-sm">{row.yoy}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Sparkline data={row.spark} color={row.trend === 'up' ? EMERALD : ROSE} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Footer summary row */}
                            <div className="p-5 border-t border-white/5 flex gap-8 text-xs text-zinc-500">
                                <span>Total Q4: <strong className="text-white">${TABLE_DATA.reduce((s, r) => s + r.q4, 0).toLocaleString()}K</strong></span>
                                <span>Avg YoY: <strong className="text-emerald-400">+19.4%</strong></span>
                                <span>Best region: <strong className="text-white">{TABLE_DATA.sort((a, b) => b.q4 - a.q4)[0].region}</strong></span>
                                <span className="ml-auto">Click headers to sort • All values in $K</span>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ REAL-TIME STREAM ══════════════════════════════════════ */}
                    {activeTab === 'stream' && (
                        <motion.div key="stream"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                            className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full"
                        >
                            {/* Live metric cards */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Live — 400ms feed</span>
                                </div>
                                {[
                                    { label: 'Revenue Index', key: 'revenue', color: EMERALD, unit: '$K' },
                                    { label: 'Anomaly Score', key: 'anomaly', color: ROSE, unit: '%' },
                                    { label: 'Inference ms', key: 'latency', color: CYAN, unit: 'ms' },
                                ].map(m => {
                                    const last = streamData[streamData.length - 1];
                                    const prev = streamData[streamData.length - 2];
                                    const val = (last as any)[m.key] as number;
                                    const pval = (prev as any)[m.key] as number;
                                    const up = val >= pval;
                                    return (
                                        <div key={m.key} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{m.label}</div>
                                            <div className="text-3xl font-black tabular-nums" style={{ color: m.color }}>
                                                {val.toFixed(1)}<span className="text-sm font-normal text-zinc-500 ml-1">{m.unit}</span>
                                            </div>
                                            <div className={`text-xs mt-1 font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {up ? '▲' : '▼'} {Math.abs(val - pval).toFixed(1)}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mt-auto">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Stream Stats</div>
                                    <div className="text-xs text-zinc-400 space-y-1">
                                        <div className="flex justify-between"><span>Window</span><span className="text-white">60 pts</span></div>
                                        <div className="flex justify-between"><span>Rate</span><span className="text-white">2.5 Hz</span></div>
                                        <div className="flex justify-between"><span>Metrics</span><span className="text-white">3</span></div>
                                        <div className="flex justify-between"><span>Points seen</span><span className="text-white">{streamTickRef.current}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Rolling chart */}
                            <div className="lg:col-span-3 flex flex-col gap-4">
                                <div className="flex-1 bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                                    <div className="text-xs font-semibold text-zinc-400 mb-3">Revenue Index — rolling 60s window</div>
                                    <ResponsiveContainer width="100%" height={140}>
                                        <AreaChart data={streamData} margin={{ top: 4, right: 8, left: -30, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="sgRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={EMERALD} stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="t" tick={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 9, fill: '#71717a' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="revenue" stroke={EMERALD} fill="url(#sgRev)" strokeWidth={2} dot={false} name="Revenue $K" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-4" style={{ flex: '0 0 auto' }}>
                                    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                                        <div className="text-xs font-semibold text-zinc-400 mb-3">Anomaly Score %</div>
                                        <ResponsiveContainer width="100%" height={100}>
                                            <LineChart data={streamData} margin={{ top: 4, right: 8, left: -30, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis dataKey="t" tick={false} axisLine={false} />
                                                <YAxis tick={{ fontSize: 9, fill: '#71717a' }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="anomaly" stroke={ROSE} strokeWidth={2} dot={false} name="Anomaly %" isAnimationActive={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                                        <div className="text-xs font-semibold text-zinc-400 mb-3">Inference Latency ms</div>
                                        <ResponsiveContainer width="100%" height={100}>
                                            <LineChart data={streamData} margin={{ top: 4, right: 8, left: -30, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis dataKey="t" tick={false} axisLine={false} />
                                                <YAxis tick={{ fontSize: 9, fill: '#71717a' }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="latency" stroke={CYAN} strokeWidth={2} dot={false} name="Latency ms" isAnimationActive={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ SANKEY REVENUE FLOW ════════════════════════════════════ */}
                    {activeTab === 'sankey' && (
                        <motion.div key="sankey"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                            className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full"
                        >
                            {/* Info sidebar */}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="text-base font-bold text-white mb-1">Revenue Flow</div>
                                    <div className="text-xs text-zinc-400 leading-relaxed">Sankey diagram showing how raw data sources flow through the AI stack to business outcomes.</div>
                                </div>
                                {[
                                    { label: 'Sources', nodes: 'CRM, Marketing, Ops', color: EMERALD },
                                    { label: 'Layer 1', nodes: 'Data Lake', color: CYAN },
                                    { label: 'Layer 2', nodes: 'ML Engine, LLM Agent', color: VIOLET },
                                    { label: 'Outcomes', nodes: 'Dashboard, Alerts, Revenue', color: AMBER },
                                ].map(s => (
                                    <div key={s.label} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                                        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: s.color }}>{s.label}</div>
                                        <div className="text-xs text-zinc-300">{s.nodes}</div>
                                    </div>
                                ))}
                                <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-xs text-zinc-500">
                                    Width of each band = relative data volume flowing through that connection.
                                </div>
                            </div>

                            {/* Plotly Sankey */}
                            <div className="lg:col-span-3">
                                <PlotlySankey />
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </section>
    );
}
