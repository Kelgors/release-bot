# Release Bot

A small monorepo that watches GitHub releases and notifies subscribed Discord (and future Telegram) channels.

## What It Does

- `bot-discord`: Discord bot package (`/watch add|remove|list`) to manage subscriptions.
- `bot-telegram`: Telegram bot package (present but not implemented yet).
- `runner-github`: polling worker that checks watched repositories and sends notifications.
- `db`: shared Prisma schema/client and database access.
- `runner-lib`: shared runner logic.

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Create .env files in each apps

```env
APP_STAGE=dev
DATABASE_URL=postgresql://user:password@localhost:5432/release_bot

# Discord bot
DISCORD_CLIENT_ID=...
DISCORD_BOT_TOKEN=...

# GitHub runner
GITHUB_TOKEN=...
INTERVAL_MIN=60
```

3. Generate Prisma client and run migrations:

```bash
pnpm --filter @release-bot/db run dev:db:generate
pnpm --filter @release-bot/db run dev:db:migrate
```

4. Run services in dev mode (separate terminals):

```bash
pnpm --filter @release-bot/discord run dev
pnpm --filter @release-bot/runner-github run dev
```

5. Use Discord command:

```text
/watch add owner/repo
```

## Useful Commands

```bash
# Build all packages
pnpm turbo build

# Run checks
pnpm turbo check

# Run tests
pnpm turbo test:run
```

## Docker

The `Dockerfile` builds and deploys a single package image. Pass `PACKAGE_NAME` when building.

Example:

```bash
docker build --build-arg PACKAGE_NAME=@release-bot/runner-github -t release-bot-runner .
```
