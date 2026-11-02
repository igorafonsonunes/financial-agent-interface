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

Acesse `http://localhost:3000`. A interface consulta `GET /backend/api/health`, encaminhado pelo Next.js para `API_ORIGIN`.

Para executar o ambiente completo sem PostgreSQL instalado localmente, a partir da pasta `Projetos`:

```bash
docker compose up --build
```

Isso inicia PostgreSQL em `localhost:5432`, API em `localhost:3001` e frontend em `localhost:3000`. O Compose da raiz é a configuração canônica do ambiente integrado; este repositório mantém apenas a imagem do frontend.

## Produção

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

O Dockerfile recebe `API_ORIGIN` como argumento de build para configurar o proxy do backend.
