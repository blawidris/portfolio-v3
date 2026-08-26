# Prisma migration baseline procedure

The repository previously had a Prisma schema and deployed-data assumptions but no migration history. The `20260826000000_baseline` migration represents the existing `Post`, `Project`, and `FooterLink` schema as already deployed.

No database was configured or accessible during Phase 0. The migration file has therefore been generated and committed, but it has **not** been marked as applied against any deployed database.

## Existing deployed database

Do not run `prisma migrate deploy` against an existing portfolio database until this procedure is complete.

1. Confirm a recent, restorable database backup exists with the hosting provider.
2. Set `DATABASE_URL` to the pooled runtime URL and `DIRECT_URL` to the direct administrative URL.
3. Introspect into a temporary schema file or a disposable repository copy; do not overwrite reviewed application changes blindly.
4. Compare the deployed schema with `prisma/schema.prisma` and the baseline SQL.
5. Resolve every drift difference without dropping or recreating existing tables.
6. When the deployed schema matches, mark the baseline as already applied:

```bash
npx prisma migrate resolve --applied 20260826000000_baseline
```

7. Verify with `npm run db:migrate:status` and `npm run db:validate`.
8. Only after the baseline is recorded should production use `npm run db:migrate:deploy`.

## New empty development or CI database

Apply the baseline normally with `npm run db:migrate:deploy`. Future development changes use:

```bash
npm run db:migrate -- --name descriptive_change_name
```

Never run destructive tests, `migrate reset`, or an unreviewed migration against production.
