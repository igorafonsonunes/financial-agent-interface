export type ApiRecord = Record<string, unknown>;
const API = process.env.NEXT_PUBLIC_API_URL ?? '/backend';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const endpoints = { accounts: '/accounts', categories: '/categories', profiles: '/profiles', merchants: '/merchants', rules: '/rules', transactions: '/transactions', imports: '/imports' };
