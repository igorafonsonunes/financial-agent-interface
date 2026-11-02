'use client';

import { useEffect, useState } from 'react';
import { fetchHealth } from '@/services/health-service';
import type { HealthResponse } from '@/types/health';

export type ConnectionState = 'checking' | 'connected' | 'unavailable';

export function useHealth() {
  const [state, setState] = useState<ConnectionState>('checking');
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then((response) => {
        setHealth(response);
        setState(response.status === 'ok' ? 'connected' : 'unavailable');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setHealth(null);
        setState('unavailable');
      });

    return () => controller.abort();
  }, []);

  return { state, health };
}
