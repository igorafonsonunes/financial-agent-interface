'use client';

import { useEffect, useState } from 'react';

type Metric = {
  label: string;
  value: string;
  change: string;
  accent: string;
};

type Transaction = {
  name: string;
  category: string;
  value: string;
  time: string;
};

type Allocation = {
  name: string;
  value: number;
  tone: string;
};

type Goal = {
  name: string;
  target: string;
  progress: number;
  value: string;
};

type DashboardData = {
  metrics: Metric[];
  transactions: Transaction[];
  allocation: Allocation[];
  goals: Goal[];
  insights: string[];
};

const defaultData: DashboardData = {
  metrics: [
    { label: 'Net worth', value: '$1.84M', change: '+12.4%', accent: 'text-emerald-300' },
    { label: 'Cash flow', value: '$48.2K', change: '+6.1%', accent: 'text-cyan-300' },
    { label: 'Monthly burn', value: '$16.8K', change: '-3.2%', accent: 'text-violet-300' },
    { label: 'Portfolio yield', value: '8.7%', change: '+1.9%', accent: 'text-amber-300' },
  ],
  transactions: [
    { name: 'Apex Capital', category: 'ETF purchase', value: '-$4,200', time: 'Today, 10:23' },
    { name: 'Payroll', category: 'Operating account', value: '+$12,800', time: 'Today, 08:10' },
    { name: 'Northwind Labs', category: 'Vendor payment', value: '-$1,860', time: 'Yesterday' },
    { name: 'Dividend income', category: 'Portfolio income', value: '+$890', time: 'Yesterday' },
  ],
  allocation: [
    { name: 'Equities', value: 42, tone: 'bg-cyan-400' },
    { name: 'Bonds', value: 25, tone: 'bg-violet-400' },
    { name: 'Real estate', value: 18, tone: 'bg-emerald-400' },
    { name: 'Crypto', value: 15, tone: 'bg-amber-400' },
  ],
  goals: [
    { name: 'Emergency fund', target: '$120K', progress: 76, value: '$91.2K' },
    { name: 'House down payment', target: '$180K', progress: 54, value: '$97.4K' },
    { name: 'Travel fund', target: '$30K', progress: 68, value: '$20.4K' },
  ],
  insights: [
    'Increase monthly transfer to your tax reserve by $1.2K.',
    'Your cash yield exceeds the 90-day benchmark by 1.4%.',
    'Two recurring subscriptions can be paused to reduce burn by 2.6%.',
  ],
};

const normalizeMetrics = (value: unknown): Metric[] => {
  if (!Array.isArray(value)) return defaultData.metrics;

  return value.map((entry, index) => {
    const item = entry as Record<string, unknown>;
    return {
      label: String(item.label ?? `Metric ${index + 1}`),
      value: String(item.value ?? '$0'),
      change: String(item.change ?? '+0%'),
      accent: String(item.accent ?? 'text-cyan-300'),
    };
  });
};

const normalizeTransactions = (value: unknown): Transaction[] => {
  if (!Array.isArray(value)) return defaultData.transactions;

  return value.map((entry, index) => {
    const item = entry as Record<string, unknown>;
    return {
      name: String(item.name ?? `Transaction ${index + 1}`),
      category: String(item.category ?? 'General'),
      value: String(item.value ?? '$0'),
      time: String(item.time ?? 'Today'),
    };
  });
};

const normalizeAllocation = (value: unknown): Allocation[] => {
  if (!Array.isArray(value)) return defaultData.allocation;

  return value.map((entry, index) => {
    const item = entry as Record<string, unknown>;
    return {
      name: String(item.name ?? `Asset ${index + 1}`),
      value: Number(item.value ?? 0),
      tone: String(item.tone ?? 'bg-cyan-400'),
    };
  });
};

const normalizeGoals = (value: unknown): Goal[] => {
  if (!Array.isArray(value)) return defaultData.goals;

  return value.map((entry, index) => {
    const item = entry as Record<string, unknown>;
    return {
      name: String(item.name ?? `Goal ${index + 1}`),
      target: String(item.target ?? '$0'),
      progress: Number(item.progress ?? 0),
      value: String(item.value ?? '$0'),
    };
  });
};

const normalizeInsights = (value: unknown): string[] => {
  if (!Array.isArray(value)) return defaultData.insights;
  return value.map((item) => String(item));
};

const asObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const normalizeDashboardData = (payload: unknown): DashboardData | null => {
  if (!payload || typeof payload !== 'object') return null;

  const source = asObject(payload);
  const data = asObject(source.data);
  const summary = asObject(source.summary);
  const portfolio = asObject(source.portfolio);
  const savings = asObject(source.savings);
  const ai = asObject(source.ai);
  const dashboard = asObject(source.dashboard ?? source.analytics ?? source.summaryData ?? source.result);

  const netWorth = Number(summary.netWorth ?? dashboard.netWorth ?? source.netWorth ?? 1840000);
  const cashFlow = Number(summary.cashFlow ?? dashboard.cashFlow ?? source.cashFlow ?? 48200);
  const monthlyBurn = Number(summary.monthlyBurn ?? dashboard.monthlyBurn ?? source.monthlyBurn ?? 16800);
  const yieldValue = Number(summary.portfolioYield ?? dashboard.portfolioYield ?? source.portfolioYield ?? 8.7);

  const metrics = normalizeMetrics(
    source.metrics ?? data.metrics ?? summary.metrics ?? [
      { label: 'Net worth', value: `$${(netWorth / 1000000).toFixed(2)}M`, change: '+12.4%', accent: 'text-emerald-300' },
      { label: 'Cash flow', value: `$${(cashFlow / 1000).toFixed(1)}K`, change: '+6.1%', accent: 'text-cyan-300' },
      { label: 'Monthly burn', value: `$${(monthlyBurn / 1000).toFixed(1)}K`, change: '-3.2%', accent: 'text-violet-300' },
      { label: 'Portfolio yield', value: `${yieldValue.toFixed(1)}%`, change: '+1.9%', accent: 'text-amber-300' },
    ],
  );

  const transactions = normalizeTransactions(
    source.transactions ?? data.transactions ?? source.activity ?? dashboard.transactions ?? source.items,
  );

  const allocationFromSource = Array.isArray(source.allocation)
    ? source.allocation
    : Array.isArray(dashboard.allocation)
      ? dashboard.allocation
      : Array.isArray(source.categories)
        ? source.categories.map((item, index) => {
            const cat = asObject(item);
            return {
              name: String(cat.name ?? `Category ${index + 1}`),
              value: Number(cat.value ?? cat.amount ?? 0),
              tone: ['bg-cyan-400', 'bg-violet-400', 'bg-emerald-400', 'bg-amber-400'][index % 4],
            };
          })
        : null;

  const allocation = normalizeAllocation(allocationFromSource ?? source.allocation ?? data.allocation ?? portfolio.allocation);

  const goals = normalizeGoals(
    source.goals ?? data.goals ?? savings.goals ?? dashboard.goals ?? {
      emergency: { target: '$120K', progress: 76, value: '$91.2K' },
      house: { target: '$180K', progress: 54, value: '$97.4K' },
      travel: { target: '$30K', progress: 68, value: '$20.4K' },
    },
  );

  const insights = normalizeInsights(
    source.insights ?? data.insights ?? ai.insights ?? dashboard.insights ?? [
      'Increase monthly transfer to your tax reserve by $1.2K.',
      'Your cash yield exceeds the 90-day benchmark by 1.4%.',
      'Two recurring subscriptions can be paused to reduce burn by 2.6%.',
    ],
  );

  return {
    metrics,
    transactions,
    allocation,
    goals,
    insights,
  };
};

async function loadDashboardData(): Promise<DashboardData> {
  const urls = Array.from(
    new Set([
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
      'http://localhost:3000/analytics/dashboard',
      'http://localhost:3000/analytics/monthly',
      'http://localhost:3000/analytics/categories',
      'http://localhost:3000/transactions',
      'http://localhost:3000/accounts',
      'http://localhost:3000',
      'http://localhost:3000/api',
    ]),
  );

  let lastError: unknown;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json, text/plain, */*' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      if (!text) continue;

      const payload = text.trim().startsWith('{') || text.trim().startsWith('[')
        ? JSON.parse(text)
        : { message: text };

      const normalized = normalizeDashboardData(payload);
      if (normalized) return normalized;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn('Using fallback dashboard data because the API is unavailable:', lastError);
  }

  return defaultData;
}

export default function Home() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('Fallback');

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const dashboardData = await loadDashboardData();
        if (!active) return;

        setData(dashboardData);
        setSource('Live API');
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setSource('Fallback');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 text-sm font-bold text-slate-950">
                A
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Finance</p>
                <h1 className="text-lg font-semibold text-white">Astra</h1>
              </div>
            </div>

            <nav className="mt-8 space-y-2 text-sm text-slate-300">
              {['Overview', 'Portfolio', 'Forecasting', 'Cash flow', 'Goals', 'AI advisor'].map((item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 transition ${
                    index === 0
                      ? 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/30'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item}</span>
                  {index === 0 ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> : null}
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">AI brief</p>
              <p className="mt-3 text-sm text-slate-200">
                Risk is below target. Rebalance 3.2% of cash into defensive equity.
              </p>
            </div>
          </aside>

          <section className="space-y-6">
            <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Good morning, Elena</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">Portfolio pulse</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
                  {isLoading ? 'Loading...' : source}
                </div>
                <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
                  Q3 Review
                </button>
                <button className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:brightness-110">
                  New plan
                </button>
              </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{metric.label}</span>
                    <span className={`font-medium ${metric.accent}`}>{metric.change}</span>
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Performance</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">Net assets</h3>
                  </div>
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    +8.4% vs last month
                  </div>
                </div>

                <div className="mt-8 flex h-44 items-end gap-3">
                  {[42, 58, 48, 62, 80, 72, 88].map((value, index) => (
                    <div key={value + index} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-cyan-500 via-blue-500 to-violet-500 shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                        style={{ height: `${value}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <p className="text-sm text-slate-400">Allocation</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Portfolio mix</h3>

                <div className="mt-5 space-y-4">
                  {data.allocation.map((item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                        <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Activity</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">Recent transactions</h3>
                  </div>
                  <button className="text-sm text-cyan-300 hover:text-cyan-200">View all</button>
                </div>

                <div className="mt-5 space-y-4">
                  {data.transactions.map((transaction) => (
                    <div key={`${transaction.name}-${transaction.time}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                      <div>
                        <div className="font-medium text-white">{transaction.name}</div>
                        <div className="text-sm text-slate-400">{transaction.category}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.value.startsWith('+') ? 'text-emerald-300' : 'text-slate-100'}`}>
                          {transaction.value}
                        </div>
                        <div className="text-xs text-slate-500">{transaction.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">AI insights</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Smart recommendations</h3>

                  <ul className="mt-5 space-y-3 text-sm text-slate-200">
                    {data.insights.map((item) => (
                      <li key={item} className="flex gap-3 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Goals</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Saving plan</h3>

                  <div className="mt-5 space-y-4">
                    {data.goals.map((goal) => (
                      <div key={goal.name}>
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                          <span>{goal.name}</span>
                          <span>{goal.value}</span>
                        </div>
                        <div className="mb-1 h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${goal.progress}%` }} />
                        </div>
                        <div className="text-right text-[11px] uppercase tracking-[0.15em] text-slate-500">
                          {goal.target}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
