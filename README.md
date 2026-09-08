# On My Plate

See everyone's workload at a glance and who has room for more.

## What it is

On My Plate is a team workload visualizer that takes the "plate" metaphor literally. Each teammate gets a circular plate divided into wedges — one per task. Wedges are sized by how much of a person's capacity a task takes up, and they fade out as tasks approach their due date, eventually disappearing when complete.

**The core idea:** when a team lead wants to assign a new task, they can see at a glance who has room and preview exactly how full the assignee's plate would become before committing.

## Features

- **Plate visualization** — annular ring chart where each wedge = one task, sized by % of plate capacity
- **Opacity fading** — wedges fade linearly as the due date approaches (or as manual progress increases), disappearing when done
- **Recurring vs sprint tasks** — recurring tasks (code reviews, meetings) render in a distinct color with a dashed stroke and never fade; sprint tasks fade with time
- **Task preview** — when adding a task, a ghost wedge shows the impact before saving
- **Load color coding** — plate center text shifts from white → purple (≥90% full) → orange/red (over capacity)
- **Hover detail** — hover a wedge to translate it outward with a glow effect; the corresponding task row in the list highlights
- **Team overview** — all plates visible side by side with a team-average load metric

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma 7** with `@prisma/adapter-libsql`
- **Turso** (libSQL) for the database — local SQLite file in dev, Turso in production
- **Tailwind CSS** + **shadcn/ui** for base components
- **Instrument Sans** + **JetBrains Mono** for typography

## Data model

```
Project
  └── Member (capacityPercent defaults to 100)
        └── Task (name, platePercent, isRecurring, dueDate, manualProgress, color)
```

## Running locally

```bash
npm install
npm run dev
```

The dev server uses a local SQLite file at `prisma/dev.db`. If starting fresh, apply the schema:

```bash
node scripts/migrate-turso.mjs   # against Turso
# or for local SQLite:
sqlite3 prisma/dev.db < prisma/migrations/20260831194504_init/migration.sql
```

## Environment variables

```
# Local dev (default)
DATABASE_URL="file:./dev.db"

# Turso (production)
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"
```

When `TURSO_DATABASE_URL` is set, the app connects to Turso automatically. When it isn't, it falls back to the local SQLite file.

## Planned

- Delete / edit tasks
- Manual progress slider on existing tasks
- Linear integration (import tasks from a sprint)
- Auth — team members sign up and see their own project's plates
- Historical completion data to calibrate capacity estimates over time
