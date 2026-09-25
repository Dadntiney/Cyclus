# Cyclus

Jouw lichaam. Jouw ritme. Jouw dag.

Cyclus is een Nederlandstalige wellness-app die training, voeding en herstel
afstemt op jouw eigen cyclus en dagelijkse check-ins. Gebouwd met Next.js
(App Router), TypeScript, Tailwind CSS en Supabase (Postgres, Auth, Row
Level Security).

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase**: Postgres, Authentication, Row Level Security
- **Zod** voor validatie

## Aan de slag

```bash
npm install
cp .env.example .env.local   # vul je Supabase-project gegevens in
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Het schema en de RLS-policies staan als migraties in `supabase/migrations`.
Pas ze toe op een Supabase-project met de Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## Architectuur

- `src/app` — routes (App Router), met route groups `(auth)` en `(app)`
- `src/components` — UI-componenten per domein
- `src/lib/actions` — Server Actions (schrijven naar Supabase)
- `src/lib/data` — server-side data fetching
- `src/lib/supabase` — Supabase client helpers (browser, server, middleware/proxy)
- `src/lib/cycle` — cyclus-schattingen en cyclushistorie
- `src/lib/recommendations` — personalisatie-engine voor Vandaag
- `src/lib/buddy` — chat-architectuur met vervangbare AI-provider
- `src/lib/i18n` — vertaalarchitectuur (momenteel alleen `nl-NL`)

## Buddy / AI

De Buddy-chat heeft een server-side providerabstractie
(`src/lib/buddy`). Zonder `BUDDY_AI_API_KEY` gebruikt de app een eerlijke,
regelgebaseerde fallback die nooit doet alsof het een AI-model is. Zodra een
geldige sleutel als serverside env var beschikbaar is, schakelt de app over
op een echte AI-provider.

## Deployment

Gebouwd voor Vercel. Zie `.env.example` voor de vereiste environment
variables.
