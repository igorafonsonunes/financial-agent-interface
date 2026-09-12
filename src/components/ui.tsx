'use client';
import { ReactNode } from 'react';

export function Money({ cents, className = '' }: { cents?: unknown; className?: string }) {
  const value = typeof cents === 'number' && Number.isFinite(cents) ? cents : 0;
  return <span className={className}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100)}</span>;
}
export function DateValue({ value }: { value?: unknown }) {
  if (!value || typeof value !== 'string') return <span>—</span>;
  const date = new Date(value); return <span>{Number.isNaN(date.valueOf()) ? '—' : new Intl.DateTimeFormat('pt-BR').format(date)}</span>;
}
export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section>; }
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) { return <header className="page-header"><div><p className="eyebrow">{eyebrow ?? 'Financial Core'}</p><h1>{title}</h1></div>{children}</header>; }
export function LoadingState() { return <div className="state" role="status">Carregando dados da API…</div>; }
export function ErrorState({ error }: { error: unknown }) { return <div className="state state-error" role="alert">Não foi possível carregar os dados: {error instanceof Error ? error.message : 'erro desconhecido'}.</div>; }
export function EmptyState({ title = 'Nenhum resultado', children }: { title?: string; children?: ReactNode }) { return <div className="state"><strong>{title}</strong>{children && <p>{children}</p>}</div>; }
export function Unavailable({ title, endpoint }: { title: string; endpoint: string }) { return <Card><div className="unavailable"><Badge tone="amber">API pendente</Badge><h2>{title}</h2><p>Esta tela depende de um endpoint que ainda não existe no Financial Core. Nenhuma regra financeira é calculada no navegador.</p><code>{endpoint}</code></div></Card>; }
