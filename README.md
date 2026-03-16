# Asset Manager Monorepo

Autonomous multi-agent mission control platform built as a pnpm workspace.

## Tech Stack

- Node.js 24
- pnpm workspaces
- TypeScript
- React + Vite frontend (`artifacts/nexus-ai`)
- Express API (`artifacts/api-server`)
- PostgreSQL + Drizzle ORM (`lib/db`)

## Monorepo Structure

- `artifacts/api-server`: backend API
- `artifacts/nexus-ai`: main frontend app
- `lib/db`: database schema and Drizzle config
- `lib/api-spec`: OpenAPI spec
- `lib/api-client-react`: generated API client/hooks for frontend
- `lib/api-zod`: generated zod schemas

## Prerequisites

1. Node.js 24+
2. pnpm 10+
3. PostgreSQL 17+ (or any compatible Postgres)

## Install Dependencies

Use pnpm only (npm/yarn are blocked by preinstall checks):

```bash
pnpm install
```

## Environment Variables

### API (`artifacts/api-server`)

Required:

- `PORT` (example: `5000`)
- `DATABASE_URL` (example: `postgresql://postgres:postgres@localhost:5432/asset_manager`)

### Frontend (`artifacts/nexus-ai`)

Required:

- `PORT` (example: `5174`)
- `BASE_PATH` (use `/` for local dev)

## Database Setup (Local)

1. Create database:

```bash
createdb asset_manager
```

2. Push schema:

```bash
cd lib/db
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/asset_manager" pnpm run push
```

## Run Locally

Open two terminals from repo root.

### Terminal 1: API

```bash
PORT=5000 DATABASE_URL="postgresql://postgres:postgres@localhost:5432/asset_manager" NODE_ENV=development pnpm --filter @workspace/api-server exec tsx ./src/index.ts
```

### Terminal 2: Frontend

```bash
MSYS_NO_PATHCONV=1 PORT=5174 BASE_PATH=/ pnpm --filter @workspace/nexus-ai dev
```

App URLs:

- Frontend: `http://localhost:5174/`
- API health: `http://localhost:5000/api/healthz`
- API via frontend proxy: `http://localhost:5174/api/healthz`

## Windows Notes

If you use Git Bash, keep `MSYS_NO_PATHCONV=1` in the frontend command so `BASE_PATH=/` is not rewritten.

If `createdb` is not on PATH, use the installed PostgreSQL binaries directly, for example:

```bash
"/c/Program Files/PostgreSQL/17/bin/createdb.exe" -U postgres -h localhost asset_manager
```

## Useful Workspace Commands

From repo root:

```bash
pnpm run typecheck
pnpm run build
```

## Troubleshooting

### Error: Use pnpm instead

Cause: `npm install` or `yarn install` used.

Fix:

```bash
pnpm install
```

### Error: `DATABASE_URL must be set`

Set `DATABASE_URL` before starting API and before running Drizzle push.

### Error: connection refused to Postgres

- Ensure PostgreSQL service is running.
- Verify host/port/user/password in `DATABASE_URL`.
- Confirm database `asset_manager` exists.

### Frontend `/api/*` returns HTML

Ensure frontend is running from `artifacts/nexus-ai` config with proxy enabled and API is running on port 5000.
