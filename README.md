# Financial Agent Interface

Fundação da interface web do Financial Agent, construída com Next.js, React e TypeScript.

Esta entrega contém apenas o ambiente institucional e a verificação de conexão com a API. Não há dashboard, saldos ou transações fictícias.

## Requisitos

- Node.js 22 LTS
- Docker e Docker Compose

## Desenvolvimento

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Acesse `http://localhost:8080`. A interface consulta `GET /backend/api/health`, encaminhado pelo Next.js para `API_ORIGIN`.

## Produção

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

O Dockerfile recebe `API_ORIGIN` como argumento de build para configurar o proxy do backend.
