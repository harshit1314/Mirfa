# Mirfa Secure Transactions Mini-App

Secure transaction service featuring AES-256-GCM Envelope Encryption.

## Structure
- `apps/web`: Next.js frontend to interact with the service.
- `apps/api`: Fastify backend handling encryption and persistence.
- `packages/crypto`: Core encryption logic and utilities.

## Setup & Running

### 1. Prerequisites
- Node.js 20+
- pnpm

### 2. Installation
```bash
pnpm install
```

### 3. Build & Development
Build the shared crypto package first:
```bash
pnpm --filter @mirfa/crypto build
```

Start the monorepo in dev mode:
```bash
pnpm dev
```

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:4000`

## Features
- **Envelope Encryption**: Uses AES-256-GCM with random DEKs and a Master Key.
- **SQLite Storage**: Persistent record storage using `better-sqlite3`.
- **Validation**: Strict nonce, tag, and hex validation.
- **Unit Testing**: Verified crypto logic with `vitest`.

## License
MIT
