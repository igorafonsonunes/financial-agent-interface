'use client';

import { useHealth } from '@/hooks/use-health';

const statusContent = {
  checking: {
    label: 'Verificando conexão',
    detail: 'Consultando a API do Financial Agent.',
    className: 'status-checking',
  },
  connected: {
    label: 'API conectada',
    detail: 'Backend e PostgreSQL respondendo normalmente.',
    className: 'status-connected',
  },
  unavailable: {
    label: 'API indisponível',
    detail: 'Não foi possível consultar o backend agora.',
    className: 'status-unavailable',
  },
} as const;

export function ConnectionStatus() {
  const { state } = useHealth();
  const content = statusContent[state];

  return (
    <section className={`connection-status ${content.className}`} aria-live="polite">
      <span className="status-dot" aria-hidden="true" />
      <div>
        <strong>{content.label}</strong>
        <p>{content.detail}</p>
      </div>
    </section>
  );
}
