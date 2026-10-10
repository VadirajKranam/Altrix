# Altrix

Altrix is a TypeScript-first migration engine that builds schema metadata from decorators, diffs against a snapshot, generates SQL migrations, and applies revisions with an Alembic-like workflow.

## What it does

- Defines schema via decorators (`@Table`, `@Column`, `@PrimaryKey`, `@Index`, `@ForeignKey`)
- Generates migration files from schema diffs
- Tracks and applies revisions (`upgrade`, `current`, `history`, `heads`)
- Supports unit tests and Docker-backed PostgreSQL integration tests

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop / Docker daemon (for integration tests)

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Migration commands

Create a migration from model changes:

```bash
node ./dist/src/cli/index.js migrate create add_posts_table
```

Apply migrations to head (adapter required):

```bash
node ./dist/src/cli/index.js migrate upgrade head --adapter ./dist/examples/postgres-db-adapter.js
```

Show current revision:

```bash
node ./dist/src/cli/index.js migrate current --adapter ./dist/examples/postgres-db-adapter.js
```

Inspect revision graph:

```bash
node ./dist/src/cli/index.js migrate history
node ./dist/src/cli/index.js migrate heads
```

## Tests

### Unit tests (fast)

```bash
make test-unit
```

### Integration tests (PostgreSQL via Docker)

```bash
make pg-up
make test-integration
make pg-down
```

### Full test suite

```bash
make test-all
```

## Useful Make commands

```bash
make deps
make build
make typecheck
make pg-logs
make pg-reset
make clean
```

## Environment

Default integration DB URL in Makefile:

```bash
postgresql://altrix:altrix@localhost:54329/altrix_test
```

Override when needed:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db make test-integration
```

## More docs

- `cli-guide.md`
- `decorator-to-migration-pipeline.md`
- `TESTING.md`
