'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Tab = 'dashboard' | 'transactions' | 'accounts' | 'imports' | 'analytics';
type ApiRecord = Record<string, unknown>;

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transações' },
  { id: 'accounts', label: 'Contas' },
  { id: 'imports', label: 'Importações' },
  { id: 'analytics', label: 'Análises' },
];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/10 ${className}`}>{children}</section>;
}

function Stat({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return <Card><p className="text-sm text-slate-400">{label}</p><p className={`mt-3 text-3xl font-semibold ${tone}`}>{value}</p></Card>;
}

function Dashboard() {
  const [data, setData] = useState<ApiRecord | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { request<ApiRecord>('/analytics/dashboard').then(setData).catch(e => setError(e.message)); }, []);
  const summary = (data?.summary ?? {}) as ApiRecord;
  const categories = Array.isArray(data?.categories) ? data?.categories as ApiRecord[] : [];
  return <div className="space-y-6">
    <header><p className="text-sm text-cyan-300">Financial Core</p><h1 className="mt-1 text-3xl font-bold">Visão financeira</h1><p className="mt-2 text-slate-400">Dados carregados da API.</p></header>
    {error && <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">Não foi possível carregar os dados da API: {error}.</div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat label="Receitas" value={money(Number(summary.income ?? 0))} tone="text-emerald-300" />
      <Stat label="Despesas" value={money(Number(summary.expenses ?? 0))} tone="text-rose-300" />
      <Stat label="Saldo" value={money(Number(summary.balance ?? 0))} tone="text-cyan-300" />
      <Stat label="Taxa de poupança" value={`${Number(summary.savingsRate ?? 0).toFixed(1)}%`} tone="text-violet-300" />
    </div>
    <Card><h2 className="text-lg font-semibold">Categorias</h2><div className="mt-4 space-y-3">{categories.length ? categories.slice(0, 8).map((item, i) => <div key={i} className="flex justify-between border-b border-white/5 pb-3 text-sm"><span className="text-slate-300">{String(item.category ?? 'Sem categoria')}</span><span>{money(Number(item.amount ?? 0))}</span></div>) : <p className="text-sm text-slate-500">Nenhuma categoria retornada pela API.</p>}</div></Card>
  </div>;
}

function Transactions() {
  const [items, setItems] = useState<ApiRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState('');
  const [form, setForm] = useState({ description: '', amount: '', type: 'EXPENSE', notes: '' });
  const load = () => { setLoading(true); request<ApiRecord[]>('/transactions').then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const filtered = useMemo(() => items.filter(item => String(item.displayName ?? item.description ?? '').toLowerCase().includes(search.toLowerCase())), [items, search]);
  async function create(e: FormEvent) { e.preventDefault(); await request('/transactions', { method: 'POST', body: JSON.stringify({ type: form.type, description: form.description, displayName: form.description, totalAmountCents: Math.round(Number(form.amount.replace(',', '.')) * 100), notes: form.notes || undefined }) }); setForm({ description: '', amount: '', type: 'EXPENSE', notes: '' }); load(); }
  return <div className="space-y-6"><header><h1 className="text-3xl font-bold">Transações</h1><p className="mt-2 text-slate-400">Dados carregados da API. Novos lançamentos são enviados para a API.</p></header>
    <Card><form onSubmit={create} className="grid gap-3 md:grid-cols-4"><input required placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><input required type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>EXPENSE</option><option>INCOME</option><option>TRANSFER</option><option>REFUND</option><option>ADJUSTMENT</option><option>OTHER</option></select><button className="primary">Adicionar</button></form></Card>
    <Card><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Lançamentos</h2><input className="max-w-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>{error && <p className="text-amber-300">Não foi possível carregar as transações: {error}</p>}{loading ? <p className="text-slate-500">Carregando...</p> : <div className="overflow-x-auto"><table><thead><tr><th>Descrição</th><th>Tipo</th><th>Valor</th><th>Parcelamento</th></tr></thead><tbody>{filtered.map(item => <tr key={String(item.id)}><td>{String(item.displayName ?? item.description ?? '—')}</td><td>{String(item.type ?? '—')}</td><td>{money(Number(item.totalAmountCents ?? 0))}</td><td>{item.installmentTotal ? `${String(item.installmentTotal)}x` : '—'}</td></tr>)}</tbody></table></div>}</Card>
  </div>;
}

function Accounts() {
  const [items, setItems] = useState<ApiRecord[]>([]); const [form, setForm] = useState({ name: '', institutionName: '', type: 'CHECKING' });
  const load = () => request<ApiRecord[]>('/accounts').then(setItems).catch(() => setItems([])); useEffect(load, []);
  async function create(e: FormEvent) { e.preventDefault(); await request('/accounts', { method: 'POST', body: JSON.stringify({ ...form, currency: 'BRL', active: true }) }); setForm({ name: '', institutionName: '', type: 'CHECKING' }); load(); }
  return <div className="space-y-6"><header><h1 className="text-3xl font-bold">Contas</h1><p className="mt-2 text-slate-400">Dados carregados da API. Novas contas são enviadas para a API.</p></header><Card><form onSubmit={create} className="grid gap-3 md:grid-cols-4"><input required placeholder="Nome da conta" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/><input placeholder="Instituição" value={form.institutionName} onChange={e => setForm({ ...form, institutionName: e.target.value })}/><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>CHECKING</option><option>SAVINGS</option><option>CREDIT_CARD</option><option>CASH</option><option>INVESTMENT</option><option>OTHER</option></select><button className="primary">Criar conta</button></form></Card><Card><div className="grid gap-3 md:grid-cols-2">{items.map(item => <div key={String(item.id)} className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="font-semibold">{String(item.name)}</p><p className="mt-1 text-sm text-slate-400">{String(item.institutionName ?? 'Sem instituição')} · {String(item.type)}</p></div>)}{!items.length && <p className="text-sm text-slate-500">Nenhuma conta retornada pela API.</p>}</div></Card></div>;
}

function Imports() {
  const [accounts, setAccounts] = useState<ApiRecord[]>([]); const [items, setItems] = useState<ApiRecord[]>([]); const [accountId, setAccountId] = useState(''); const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState('');
  const load = () => { request<ApiRecord[]>('/accounts').then(setAccounts).catch(() => setAccounts([])); request<ApiRecord[]>('/imports').then(setItems).catch(() => setItems([])); }; useEffect(load, []);
  async function submit(e: FormEvent) { e.preventDefault(); if (!file || !accountId) return; const content = await file.text(); const result = await request<ApiRecord>('/imports', { method: 'POST', body: JSON.stringify({ accountId, filename: file.name, content, parserType: 'generic' }) }); setMessage(`Importação ${String(result.status ?? 'criada')} — ${file.name}`); load(); }
  return <div className="space-y-6"><header><h1 className="text-3xl font-bold">Importações</h1><p className="mt-2 text-slate-400">Importe seus próprios dados por CSV e acompanhe o resultado retornado pela API.</p></header><Card><form onSubmit={submit} className="space-y-4"><select required value={accountId} onChange={e => setAccountId(e.target.value)}><option value="">Selecione a conta</option>{accounts.map(a => <option key={String(a.id)} value={String(a.id)}>{String(a.name)}</option>)}</select><input required type="file" accept=".csv,text/csv" onChange={e => setFile(e.target.files?.[0] ?? null)}/><button className="primary">Importar CSV</button>{message && <p className="text-sm text-emerald-300">{message}</p>}</form></Card><Card><h2 className="text-lg font-semibold">Histórico</h2><div className="mt-4 space-y-2">{items.map(item => <div key={String(item.id)} className="flex justify-between rounded-lg bg-white/5 p-3 text-sm"><span>{String(item.filename ?? 'Arquivo')}</span><span className="text-slate-400">{String(item.status ?? '—')}</span></div>)}{!items.length && <p className="text-sm text-slate-500">Nenhuma importação retornada pela API.</p>}</div></Card></div>;
}

function Analytics() {
  const [monthly, setMonthly] = useState<ApiRecord[]>([]); const [comparison, setComparison] = useState<ApiRecord | null>(null);
  useEffect(() => { request<ApiRecord[]>('/analytics/monthly').then(setMonthly).catch(() => setMonthly([])); request<ApiRecord>('/analytics/comparison').then(setComparison).catch(() => setComparison(null)); }, []);
  return <div className="space-y-6"><header><h1 className="text-3xl font-bold">Análises</h1><p className="mt-2 text-slate-400">Dados calculados e retornados pela API.</p></header><Card><h2 className="text-lg font-semibold">Comparação</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><Stat label="Anterior" value={money(Number(comparison?.previous ?? 0))}/><Stat label="Atual" value={money(Number(comparison?.current ?? 0))}/><Stat label="Diferença" value={money(Number(comparison?.difference ?? 0))} tone="text-cyan-300"/></div></Card><Card><h2 className="text-lg font-semibold">Mensal</h2><div className="mt-4 overflow-x-auto"><table><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Saldo</th></tr></thead><tbody>{monthly.map((row, i) => <tr key={i}><td>{String(row.month)}</td><td>{money(Number(row.income ?? 0))}</td><td>{money(Number(row.expense ?? 0))}</td><td>{money(Number(row.balance ?? 0))}</td></tr>)}</tbody></table></div></Card></div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const content = tab === 'dashboard' ? <Dashboard/> : tab === 'transactions' ? <Transactions/> : tab === 'accounts' ? <Accounts/> : tab === 'imports' ? <Imports/> : <Analytics/>;
  return <main className="min-h-screen bg-[#050816] text-slate-100"><div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8"><aside className="hidden w-60 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 lg:block"><div className="mb-8 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 font-black text-slate-950">FC</div><div><p className="font-bold">Financial Core</p><p className="text-xs text-slate-500">Personal finance</p></div></div><nav className="space-y-2">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${tab === item.id ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{item.label}</button>)}</nav></aside><div className="min-w-0 flex-1"> <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm ${tab === item.id ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300'}`}>{item.label}</button>)}</div>{content}</div></div></main>;
}
