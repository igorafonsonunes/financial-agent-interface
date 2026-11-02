import type { HealthResponse } from '@/types/health';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/backend';

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();

  if (!isHealthResponse(payload)) {
    throw new Error('Health check returned an invalid response');
  }

  return payload;
}

function isHealthResponse(payload: unknown): payload is HealthResponse {
  if (!payload || typeof payload !== 'object') return false;

  const value = payload as Record<string, unknown>;
  return (
    (value.status === 'ok' || value.status === 'error') &&
    value.api === 'ok' &&
    (value.database === 'ok' || value.database === 'error')
  );
}
