# consent-lens

> A small, opinionated exploration of the access-and-consent problem, because it seemed like the crux of a shared cross-org talent database. I made strong choices to keep it concrete — happy to be wrong about your real constraints.

Most talent systems are black boxes about who can see a person’s data. `consent-lens` makes the permission model the product: organizations see only fields a participant granted them, participants see exactly who can see what and why, and reads are visible to the person they concern.

This is intentionally a tight slice. It uses eight synthetic participants and three fictional organizations to make one hard thing inspectable rather than pretending to be a complete ATS.

## The modeling decision

PostgreSQL row-level security protects rows, not individual columns. A conventional wide `participants` table would therefore force field-level permissions into application filtering.

Here, each profile field is a row in `participant_attributes`:

```text
participant_id   key        value                    sensitivity
maya-k           skills     Evaluations · Python     standard
maya-k           email      maya.k@example.test      sensitive
```

A consent grant addresses one of those rows by `(participant, org, attribute_key)`, or uses `*` for all fields. RLS can then answer “may this org see this field?” directly. The database is the gate; TypeScript only renders the already-authorized result.

That also makes search consent-respecting by construction. Search runs over the RLS-filtered attribute rows, so an organization cannot match, filter, or rank on a field it was not granted.

## What is here

- **Organization lens:** switch among fictional orgs, browse their distinct visible pool, and search only consented fields. Missing grants stay visible as locked placeholders without exposing values.
- **Participant lens:** inspect a field × organization grant matrix with the human-readable basis for every grant, plus a reverse-chronological access feed.
- **Postgres/Supabase core:** normalized schema, RLS policies, an RLS-gated search RPC that logs reads, a participant glass-box RPC, and deterministic synthetic seed data.
- **Security notes:** the enforcement boundary, known footguns, leakage considerations, and the deliberate limits of this demo.

The checked-in UI runs from the same deterministic synthetic fixture as the SQL seed, so it is immediately explorable without credentials. The migrations are the production data contract and can be applied to Supabase when wiring a hosted instance.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a Supabase-backed deployment:

1. Create a project and apply the files in `supabase/migrations` in order.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key.
3. Call `search_pool(org_slug, query)` from the server-side route that supplies the org context.
4. Deploy to Vercel with the same two public environment variables.

Never add the service-role key to the web application. It bypasses RLS and would silently remove the central guarantee.

## Sanity-check the boundary

After applying the migrations, exercise the security boundary as the `anon` or `authenticated` role:

```sql
select set_config(
  'app.current_org_id',
  '10000000-0000-0000-0000-000000000001',
  true
);
select key, value
from participant_attributes
where participant_id = '20000000-0000-0000-0000-000000000002';
```

Aqueduct receives no rows for Jon. Change the context to Beacon (`…0002`) and the same query returns `name`, `location`, `skills`, and `seeking`—never `email` or `notes`.

The repository also includes [`supabase/tests/access_boundary.sql`](supabase/tests/access_boundary.sql), a small executable assertion of that exact boundary.

## Why there is no AI summary

I deliberately did not add an AI summary. In a system whose entire point is legible, consented access, an opaque generative layer works against the thesis — and record-backed determinism is the right default when the data is sensitive and the records must not be embellished. Restraint is the responsible call here.

## Documentation

- [`docs/product-note.md`](docs/product-note.md) — product thesis, language choices, and deliberate omissions.
- [`docs/rls-notes.md`](docs/rls-notes.md) — how the database enforcement works.
- [`docs/threat-model-lite.md`](docs/threat-model-lite.md) — trust boundaries, leakage, revocation, and audit limits.

## Next, deliberately not built

- Real authentication, participant-to-identity mapping, invitations, and SSO
- ATS imports, deduplication, matching, and pagination
- Participant-managed grant/revoke controls and notifications
- AI summaries or other generated interpretations of sensitive records
- Real or scraped participant data

Those are meaningful systems, not decorative checklist items. They should follow evidence about the real operating constraints rather than be guessed into this slice.
