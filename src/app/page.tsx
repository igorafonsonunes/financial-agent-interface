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

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function money(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Não disponível';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
}

function numberOrUnavailable(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function percentage(value: unknown) {
  const number = numberOrUnavailable(value);
  return number === null ? 'Não disponível' : `${number.toFixed(1)}%`;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/10 ${className}`}>
      {children}
    </section>
  );
}

function Stat({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${tone}`}>{value}</p>
    </Card>
  );
}

function ApiState({ loading, error, empty, children }: { loading: boolean; error: string; empty?: boolean; children: React.ReactNode }) {
  if (loading) return <p className="text-sm text-slate-500">Carregando dados da API...</p>;
  if (error) return <p className="text-sm text-amber-300">Não foi possível carregar os dados da API: {error}</p>;
  if (empty) return <p className="text-sm text-slate-500">Nenhum dado retornado pela API.</p>;
  return <>{children}</>;
}

function Dashboard() {
  const [data, setData] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    request<ApiRecord>('/analytics/dashboard')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const summary = (data?.summary ?? null) as ApiRecord | null;
  const categories = Array.isArray(data?.categories) ? (data.categories as ApiRecord[]) : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-cyan-300">Financial Core</p>
        <h1 className="mt-1 text-3xl font-bold">Visão financeira</h1>
        <p className="mt-2 text-slate-400">Somente informações retornadas pela API.</p>
      </header>

      <ApiState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Receitas" value={money(summary?.income)} tone="text-emerald-300" />
          <Stat label="Despesas" value={money(summary?.expenses)} tone="text-rose-300" />
          <Stat label="Saldo" value={money(summary?.balance)} tone="text-cyan-300" />
          <Stat label="Taxa de poupança" value={percentage(summary?.savingsRate)} tone="text-violet-300" />
        </div>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Categorias</h2>
          <div className="mt-4 space-y-3">
            {categories.length ? (
              categories.slice(0, 8).map((item, index) => (
                <div key={String(item.id ?? index)} className="flex justify-between border-b border-white/5 pb-3 text-sm">
                  <span className="text-slate-300">{String(item.category ?? item.name ?? 'Sem categoria')}</span>
                  <span>{money(item.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Nenhuma categoria retornada pela API.</p>
            )}
          </div>
        </Card>
      </ApiState>
    </div>
  );
}

function Transactions() {
  const [items, setItems] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    request<ApiRecord[]>('/transactions')
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => String(item.displayName ?? item.description ?? '').toLowerCase().includes(query));
  }, [items, search]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Transações</h1>
        <p className="mt-2 text-slate-400">Lançamentos somente de leitura, carregados pela API. Novos dados entram por importação CSV.</p>
      </header>

      <Card>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Lançamentos</h2>
            {!loading && !error && <p className="mt-1 text-xs text-slate-500">{filtered.length} registro(s) exibido(s)</p>}
          </div>
          <input className="w-full max-w-xs" placeholder="Buscar nas transações..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <ApiState loading={loading} error={error} empty={!items.length}>
          {filtered.length ? (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr><th>Descrição</th><th>Tipo</th><th>Valor</th><th>Parcelamento</th></tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={String(item.id ?? index)}>
                      <td>{String(item.displayName ?? item.description ?? '—')}</td>
                      <td>{String(item.type ?? '—')}</td>
                      <td>{money(item.totalAmountCents)}</td>
                      <td>{item.installmentTotal ? `${String(item.installmentTotal)}x` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma transação corresponde à busca.</p>
          )}
        </ApiState>
      </Card>
    </div>
  );
}

function Accounts() {
  const [items, setItems] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    request<ApiRecord[]>('/accounts')
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Contas</h1>
        <p className="mt-2 text-slate-400">Contas somente de leitura, carregadas pela API. O cadastro inicial é feito pelo backend/importação.</p>
      </header>

      <Card>
        <ApiState loading={loading} error={error} empty={!items.length}>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item, index) => (
              <div key={String(item.id ?? index)} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">{String(item.name ?? 'Conta sem nome')}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {String(item.institutionName ?? 'Sem instituição')} · {String(item.type ?? 'Tipo não informado')}
                </p>
                {typeof item.currency === 'string' && <p className="mt-2 text-xs text-slate-500">Moeda: {item.currency}</p>}
              </div>
            ))}
          </div>
        </ApiState>
      </Card>
    </div>
  );
}

function Imports() {
  const [accounts, setAccounts] = useState<ApiRecord[]>([]);
  const [items, setItems] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountId, setAccountId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [accountData, importData] = await Promise.all([
        request<ApiRecord[]>('/accounts'),
        request<ApiRecord[]>('/imports'),
      ]);
      setAccounts(accountData);
      setItems(importData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file || !accountId || submitting) return;

    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const content = await file.text();
      const result = await request<ApiRecord>('/imports', {
        method: 'POST',
        body: JSON.stringify({
          accountId,
          filename: file.name,
          content,
          parserType: 'generic',
        }),
      });

      setMessage(`Importação ${String(result.status ?? 'processada')} — ${file.name}`);
      setFile(null);
      setAccountId('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível importar o CSV');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Importações</h1>
        <p className="mt-2 text-slate-400">Esta é a única área da interface que envia dados financeiros para a API.</p>
      </header>

      <Card>
        <h2 className="text-lg font-semibold">Importar CSV</h2>
        <p className="mt-1 text-sm text-slate-500">Selecione uma conta e envie o arquivo CSV do seu banco.</p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} disabled={submitting || !accounts.length}>
            <option value="">Selecione a conta</option>
            {accounts.map((account, index) => (
              <option key={String(account.id ?? index)} value={String(account.id)}>{String(account.name ?? account.id)}</option>
            ))}
          </select>
          <input required type="file" accept=".csv,text/csv" disabled={submitting} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button className="primary" type="submit" disabled={submitting || !file || !accountId}>
            {submitting ? 'Importando...' : 'Importar CSV'}
          </button>
          {message && <p className="text-sm text-emerald-300">{message}</p>}
          {!loading && !accounts.length && !error && <p className="text-sm text-amber-300">Nenhuma conta foi retornada pela API. Cadastre uma conta no backend antes de importar.</p>}
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Histórico</h2>
        <div className="mt-4 space-y-2">
          {loading ? <p className="text-sm text-slate-500">Carregando histórico...</p> : error ? <p className="text-sm text-amber-300">{error}</p> : items.length ? items.map((item, index) => (
            <div key={String(item.id ?? index)} className="flex flex-col gap-1 rounded-lg bg-white/5 p-3 text-sm sm:flex-row sm:justify-between">
              <span>{String(item.filename ?? 'Arquivo')}</span>
              <span className="text-slate-400">{String(item.status ?? 'Status não informado')}</span>
            </div>
          )) : <p className="text-sm text-slate-500">Nenhuma importação retornada pela API.</p>}
        </div>
      </Card>
    </div>
  );
}

function Analytics() {
  const [monthly, setMonthly] = useState<ApiRecord[]>([]);
  const [comparison, setComparison] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request<ApiRecord[]>('/analytics/monthly'),
      request<ApiRecord>('/analytics/comparison'),
    ])
      .then(([monthlyData, comparisonData]) => {
        setMonthly(monthlyData);
        setComparison(comparisonData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Análises</h1>
        <p className="mt-2 text-slate-400">Indicadores calculados e retornados pela API.</p>
      </header>

      <ApiState loading={loading} error={error}>
        <Card>
          <h2 className="text-lg font-semibold">Comparação</h2>
          {comparison ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Stat label="Anterior" value={money(comparison.previous)} />
              <Stat label="Atual" value={money(comparison.current)} />
              <Stat label="Diferença" value={money(comparison.difference)} tone="text-cyan-300" />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Nenhuma comparação retornada pela API.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Mensal</h2>
          <div className="mt-4 overflow-x-auto">
            {monthly.length ? (
              <table>
                <thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Saldo</th></tr></thead>
                <tbody>
                  {monthly.map((row, index) => (
                    <tr key={String(row.month ?? index)}>
                      <td>{String(row.month ?? '—')}</td>
                      <td>{money(row.income)}</td>
                      <td>{money(row.expense ?? row.expenses)}</td>
                      <td>{money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500">Nenhum dado mensal retornado pela API.</p>
            )}
          </div>
        </Card>
      </ApiState>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const content = tab === 'dashboard'
    ? <Dashboard />
    : tab === 'transactions'
      ? <Transactions />
      : tab === 'accounts'
        ? <Accounts />
        : tab === 'imports'
          ? <Imports />
          : <Analytics />;

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-60 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 font-black text-slate-950">FC</div>
            <div><p className="font-bold">Financial Core</p><p className="text-xs text-slate-500">Personal finance</p></div>
          </div>
          <nav className="space-y-2">
            {tabs.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${tab === item.id ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {tabs.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm ${tab === item.id ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-300'}`}>
                {item.label}
              </button>
            ))}
          </div>
          {content}
        </div>
      </div>
    </main>
  );
}
