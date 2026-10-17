import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { BarChart3, TrendingUp, Users, DollarSign, ShoppingCart, Activity, ArrowUpRight, Target, Lightbulb } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dashboards = [
  {
    id: 'revenue',
    name: 'Revenue Ops',
    icon: <DollarSign className="w-4 h-4" />,
    metrics: [
      { label: 'Total MRR', value: '$1.24M', trend: '+12.5%' },
      { label: 'Net Retention', value: '114%', trend: '+2.1%' },
      { label: 'Avg Contract Value', value: '$42k', trend: '+5.4%' }
    ],
    chartColor: 'bg-emerald-500',
    strokeColor: '#10b981',
    insight: (<>MRR at <strong className="text-white font-semibold">$1.24M</strong> with <strong className="text-white font-semibold">114% net retention</strong> means existing customers expand revenue faster than churn removes it — a structural compounding advantage. Prioritise upsell motions in the high-ACV segment where the <strong className="text-white font-semibold">$42K average contract value</strong> is already trending upward (<strong className="text-white font-semibold">+5.4%</strong>).</>),
    data: [
      { name: 'Jan', value: 4000, target: 2400 },
      { name: 'Feb', value: 3000, target: 1398 },
      { name: 'Mar', value: 2000, target: 9800 },
      { name: 'Apr', value: 2780, target: 3908 },
      { name: 'May', value: 1890, target: 4800 },
      { name: 'Jun', value: 2390, target: 3800 },
      { name: 'Jul', value: 3490, target: 4300 },
    ]
  },
  {
    id: 'saas',
    name: 'SaaS Metrics',
    icon: <Activity className="w-4 h-4" />,
    metrics: [
      { label: 'Active Users', value: '84.2k', trend: '+18.2%' },
      { label: 'Customer LTV', value: '$4,250', trend: '+8.4%' },
      { label: 'Churn Rate', value: '1.2%', trend: '-0.5%' }
    ],
    chartColor: 'bg-cyan-500',
    strokeColor: '#06b6d4',
    insight: (<>Active users grew <strong className="text-white font-semibold">18.2%</strong> while churn fell to <strong className="text-white font-semibold">1.2%</strong> — acquisition quality and retention are improving simultaneously. With LTV at <strong className="text-white font-semibold">$4,250</strong>, the highest-leverage next step is reducing time-to-value to shorten the payback window and unlock earlier expansion revenue.</>),
    data: [
      { name: 'Jan', value: 2000, target: 3000 },
      { name: 'Feb', value: 3500, target: 3200 },
      { name: 'Mar', value: 4200, target: 3500 },
      { name: 'Apr', value: 5800, target: 4000 },
      { name: 'May', value: 6200, target: 4500 },
      { name: 'Jun', value: 7500, target: 5000 },
      { name: 'Jul', value: 8900, target: 5500 },
    ]
  },
  {
    id: 'dtc',
    name: 'DTC Growth',
    icon: <Users className="w-4 h-4" />,
    metrics: [
      { label: 'Blended ROAS', value: '3.4x', trend: '+0.8x' },
      { label: 'Customer Acq Cost', value: '$42.50', trend: '-12.4%' },
      { label: 'Repeat Purchase', value: '46%', trend: '+4.2%' }
    ],
    chartColor: 'bg-indigo-500',
    strokeColor: '#6366f1',
    insight: (<>ROAS of <strong className="text-white font-semibold">3.4×</strong> combined with a <strong className="text-white font-semibold">12.4% CAC reduction</strong> signals a more efficient acquisition engine. The <strong className="text-white font-semibold">46% repeat purchase rate</strong> is the real margin driver — increasing repurchase frequency by just <strong className="text-white font-semibold">5 pp</strong> would offset the equivalent of <strong className="text-white font-semibold">~15% of new-customer acquisition spend</strong>.</>),
    data: [
      { name: 'Jan', value: 1200, target: 1000 },
      { name: 'Feb', value: 1800, target: 1200 },
      { name: 'Mar', value: 1500, target: 1400 },
      { name: 'Apr', value: 2200, target: 1600 },
      { name: 'May', value: 2800, target: 1800 },
      { name: 'Jun', value: 3200, target: 2000 },
      { name: 'Jul', value: 4100, target: 2200 },
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: <ShoppingCart className="w-4 h-4" />,
    metrics: [
      { label: 'Gross Merchandise', value: '$4.8M', trend: '+24.5%' },
      { label: 'Average Order', value: '$124', trend: '+12.1%' },
      { label: 'Cart Conversion', value: '4.8%', trend: '+1.2%' }
    ],
    chartColor: 'bg-violet-500',
    strokeColor: '#8b5cf6',
    insight: (<>Cart conversion at <strong className="text-white font-semibold">4.8%</strong> is more than double the <strong className="text-white font-semibold">2–3% industry average</strong>, and AOV gains (<strong className="text-white font-semibold">+12.1% to $124</strong>) confirm bundling mechanics are working. Guard that conversion rate closely as traffic scales: a <strong className="text-white font-semibold">1 pp drop</strong> at current GMV volume (<strong className="text-white font-semibold">$4.8M</strong>) equates to roughly <strong className="text-white font-semibold">$50K in lost monthly revenue</strong>.</>),
    data: [
      { name: 'Jan', value: 5000, target: 4000 },
      { name: 'Feb', value: 4500, target: 4200 },
      { name: 'Mar', value: 6000, target: 4500 },
      { name: 'Apr', value: 7200, target: 5000 },
      { name: 'May', value: 8500, target: 5500 },
      { name: 'Jun', value: 9800, target: 6000 },
      { name: 'Jul', value: 12000, target: 6500 },
    ]
  },
  {
    id: 'gtm',
    name: 'GTM & Pipeline',
    icon: <Target className="w-4 h-4" />,
    metrics: [
      { label: 'Pipeline Velocity', value: '$850k/mo', trend: '+15.4%' },
      { label: 'Win Rate', value: '28.4%', trend: '+3.2%' },
      { label: 'Sales Cycle', value: '42 days', trend: '-8 days' }
    ],
    chartColor: 'bg-rose-500',
    strokeColor: '#f43f5e',
    insight: (<>Pipeline velocity (<strong className="text-white font-semibold">$850K/mo, +15.4%</strong>) and sales cycle compression (<strong className="text-white font-semibold">42 days, −8 days</strong>) are moving in the right direction simultaneously — a rare combination. Each additional <strong className="text-white font-semibold">1 pp of win rate</strong> at current pipeline volume adds approximately <strong className="text-white font-semibold">$30K/mo</strong> in closed revenue with no incremental headcount.</>),
    data: [
      { name: 'Jan', value: 3000, target: 3500 },
      { name: 'Feb', value: 3200, target: 3600 },
      { name: 'Mar', value: 3800, target: 3700 },
      { name: 'Apr', value: 4200, target: 3800 },
      { name: 'May', value: 4800, target: 3900 },
      { name: 'Jun', value: 5500, target: 4000 },
      { name: 'Jul', value: 6200, target: 4100 },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface DashboardShowcaseProps {
  subtitle?: string;
  title?: React.ReactNode;
  description?: string;
}

export default function DashboardShowcase({
  subtitle = "Live Product Demo",
  title = "Command Centers for Every Sector",
  description = "Explore our automated, real-time dashboards tailored for your business model."
}: DashboardShowcaseProps = {}) {
  const [activeTab, setActiveTab] = useState(dashboards[0].id);
  const activeDashboard = dashboards.find(d => d.id === activeTab) || dashboards[0];

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0.1, 0.4], [50, -50]);
  const rotateX = useTransform(scrollYProgress, [0.1, 0.4], [5, -5]);

  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
            {subtitle}
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400"
          >
            {description}
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {dashboards.map((dashboard) => (
            <motion.button
              key={dashboard.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(dashboard.id);
                trackEvent('Dashboard', 'Switch Dashboard', dashboard.id, { dashboard_id: dashboard.id });
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === dashboard.id
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
            >
              {dashboard.icon}
              {dashboard.name}
            </motion.button>
          ))}
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          key={activeTab}
          style={{ y, rotateX, perspective: 1000 }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          {/* Mac-like Header */}
          <div className="h-12 border-b border-white/10 bg-zinc-950/50 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto px-4 py-1 rounded-md bg-zinc-900 text-xs text-zinc-500 font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeDashboard.name.toUpperCase()} _ LIVE
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 md:p-8 grid gap-6"
          >
            {/* Top Metrics */}
            <motion.div
              key={`metrics-${activeTab}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {activeDashboard.metrics.map((metric, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  className="p-6 rounded-xl bg-zinc-950/50 border border-white/5 transition-colors"
                >
                  <div className="text-zinc-400 text-sm mb-2">{metric.label}</div>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{metric.value}</div>
                    <div className={`text-sm flex items-center gap-1 ${metric.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {metric.trend.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                      {metric.trend}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 p-6 rounded-xl bg-zinc-950/50 border border-white/5 flex flex-col"
              >
                <div className="text-sm font-medium text-zinc-400 mb-6 flex justify-between items-center">
                  <span>Performance Over Time</span>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-500"></div>Target</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDashboard.strokeColor }}></div>Actual</div>
                  </div>
                </div>
                <div className="flex-1 w-full h-full min-h-[200px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={activeDashboard.data}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id={`colorValue-${activeDashboard.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={activeDashboard.strokeColor} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={activeDashboard.strokeColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="target" stroke="#71717a" strokeWidth={2} strokeDasharray="5 5" fill="none" isAnimationActive={true} animationDuration={1000} />
                          <Area type="monotone" dataKey="value" stroke={activeDashboard.strokeColor} strokeWidth={3} fillOpacity={1} fill={`url(#colorValue-${activeDashboard.id})`} isAnimationActive={true} animationDuration={1000} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="p-6 rounded-xl bg-zinc-950/50 border border-white/5 flex flex-col"
              >
                <div className="text-sm font-medium text-zinc-400 mb-6">Automated Actions</div>
                <motion.div
                  key={`actions-${activeTab}`}
                  className="flex-1 flex flex-col gap-3"
                >
                  {[
                    { text: "Slack alert triggered: High Value Lead", time: "2m ago" },
                    { text: "Report generated & emailed to Execs", time: "1h ago" },
                    { text: "Anomaly detected in CAC, paused ads", time: "3h ago" },
                  ].map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <div className="text-zinc-300">{action.text}</div>
                        <div className="text-zinc-600 text-xs mt-0.5">{action.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Insight */}
            <motion.div
              key={`insight-${activeTab}`}
              variants={itemVariants}
              className="flex gap-3 rounded-2xl border border-white/5 border-l-[3px] bg-zinc-950/50 px-5 py-4"
              style={{ borderLeftColor: activeDashboard.strokeColor }}
            >
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: activeDashboard.strokeColor }} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: activeDashboard.strokeColor }}>Main Insight</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{activeDashboard.insight}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
