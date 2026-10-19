# Link Shortner

A functional URL shortener built with Next.js, PostgreSQL, Drizzle ORM, React, and Tailwind CSS.

## Features

- Create random short URLs.
- Create custom aliases such as `/my-link`.
- Redirect short URLs to their destination.
- Track click totals, referrers, user agents, and last visit times.
- View recent links and per-link statistics.
- Health endpoint at `/api/health`.
- Ready for deployment on Vercel with any hosted PostgreSQL provider.

## Run locally

Requirements:

- Node.js 20 or newer
- PostgreSQL 14 or newer

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local` to your PostgreSQL connection string.

3. Create the database tables:

```bash
npm run db:push
```

4. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import `harshitkandpal779-commits/link-shortner` into Vercel.
3. Add `DATABASE_URL` in the Vercel project Environment Variables for Production, Preview, and Development as needed.
4. Use a hosted PostgreSQL database such as Neon, Supabase, or Vercel Postgres.
5. Before the first production deployment, run the schema setup against the hosted database from a trusted local terminal:

```bash
DATABASE_URL="your-hosted-postgres-url" npx drizzle-kit push
```

6. Deploy. Vercel automatically detects the Next.js app and uses `npm run build`.

After deployment, test:

- `https://your-domain.vercel.app/`
- `https://your-domain.vercel.app/api/health`

## Database configuration

The application runtime reads `DATABASE_URL`. The local fallback shown in `drizzle.config.json` is only for local development and Drizzle CLI commands. Never commit real production credentials.

## Important note about access control

This starter is intentionally simple and does not include user authentication. Link creation, listing, and deletion are public. Add authentication and rate limiting before using it as a multi-user production service.
