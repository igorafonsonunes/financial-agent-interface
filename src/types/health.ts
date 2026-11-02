export type HealthStatus = 'ok' | 'error';

export interface HealthResponse {
  status: HealthStatus;
  api: 'ok';
  database: 'ok' | 'error';
}
