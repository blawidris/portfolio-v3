# Idris Lawal — Engineering Portfolio

A full-stack personal engineering portfolio with public project case studies, technical writing, and a private content administrator. The application is one Next.js deployment backed by PostgreSQL.

## Technology

- Next.js 16 App Router and React 19.
- TypeScript in strict mode.
- Tailwind CSS 4.
- Prisma 5 and PostgreSQL (Neon in the documented production setup).
- Auth.js 5 credentials authentication.
- Vitest.

## Runtime

Use Node.js 22. The repository declares `>=22 <23` in `package.json`, includes `.nvmrc`, and uses Node 22 in CI.

```bash
nvm use
node --version
```

## Local setup

Install exactly the dependency versions in the lockfile:

```bash
npm ci
```

Copy `.env.example` to `.env` and provide development values. Use `.env`, not `.env.local` — the Prisma CLI (`db:validate`, `db:migrate`, `db:seed`) only auto-loads `.env`, while Next.js reads both, so `.env` is the one file every tool in this project picks up. Do not commit `.env` files or real secrets.

| Variable | Scope | Purpose |
|---|---|---|
| `DATABASE_URL` | Server only, required | Pooled PostgreSQL runtime connection |
| `DIRECT_URL` | Server only, required | Direct PostgreSQL migration connection |
| `AUTH_SECRET` | Server only, required | Auth.js signing secret, at least 32 characters |
| `NEXT_PUBLIC_SITE_URL` | Public, required | Canonical absolute site origin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed-only | Read by `npm run db:seed` to bootstrap the first `Admin` row (bcrypt-hashed). Not read by the running app — rotate the password afterward via `/admin/settings`. |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Server only, optional | Sends the "forgot password" email. Without these, the app runs fine — the reset-password flow just can't deliver its email until they're set. |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` | Server only, optional | Cloudflare R2 media storage for `/admin/media`. Without these, uploads return a clear "not configured" error instead of failing silently. |

Generate an authentication secret with the Auth.js command documented in `.env.example`. Admin authentication is database-backed (`Admin` model, bcrypt-hashed passwords, login lockout after 5 failed attempts, self-service forgot/reset-password) — `npm run db:seed` creates the first admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

Start development:

```bash
npm run dev
```

The public site is available at `http://localhost:3000`; administrator login is `/admin/login`.

## Database workflow

Validate the Prisma schema:

```bash
npm run db:validate
```

Create and apply a development migration:

```bash
npm run db:migrate -- --name descriptive_change_name
```

Apply committed migrations in production or to a new empty database:

```bash
npm run db:migrate:deploy
```

Seed the existing portfolio content:

```bash
npm run db:seed
```

### Existing production database warning

The committed baseline describes a schema that may already exist in production. Do not run migration deployment against an existing database until its schema has been backed up, introspected, compared, and the baseline has been marked as applied. Follow [the baseline procedure](docs/prisma-migration-baseline.md).

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run db:validate
npm run build
```

Tests do not use production credentials. Route-handler integration tests mock persistence; CI also provisions an ephemeral PostgreSQL service and applies the full migration history to prove migrations work from an empty database.

## Deployment assumptions

The repository is designed for a Node-compatible Next.js host such as Vercel and a PostgreSQL provider such as Neon. Configure every required environment variable in the deployment environment. Run `npm run db:migrate:deploy` as an explicit release step only after the existing database baseline has been resolved.

The application fails clearly when required environment variables are missing. CI uses isolated placeholder credentials and an ephemeral PostgreSQL database; it never connects to production.

## Content safety

Project and article slugs and seed content are production data. Do not rewrite or remove them during infrastructure changes. Markdown is converted to HTML through a strict sanitizer before being rendered publicly.
