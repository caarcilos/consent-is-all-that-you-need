# consent-lens

> A small, opinionated exploration of the access-and-consent problem, because it seemed like the crux of a shared cross-org talent database. I made strong choices to keep it concrete — happy to be wrong about your real constraints.

Most talent systems are black boxes about who can see a person’s data. `consent-lens` makes the permission model the product: organizations see only fields a participant granted them, participants see exactly who can see what and why, and reads are visible to the person they concern.

This is intentionally a tight slice. It uses eight synthetic participants and three fictional organizations to make one hard thing inspectable rather than pretending to be a complete ATS.

Each visitor signs in anonymously through Supabase and receives an isolated copy of that synthetic dataset. Profile edits, organization renames, consent grants, revocations, searches, and access logs persist across refreshes in that browser. **Reset demo** restores only that visitor’s copy.

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

- **Organization lens:** switch among fictional orgs, browse their distinct visible pool, search only consented fields, and rename an organization inside your private copy.
- **Participant lens:** edit synthetic profiles, grant or revoke individual fields through the matrix, and inspect the reverse-chronological access feed.
- **Postgres/Supabase core:** anonymous auth, isolated workspaces, normalized schema, RLS policies, an RLS-gated search RPC that logs reads, and resettable seed data.
- **Security notes:** the enforcement boundary, known footguns, leakage considerations, and the deliberate limits of this demo.

Without Supabase environment variables, the UI remains explorable in read-only fixture mode. With Supabase configured, it uses anonymous auth and persistent per-visitor workspaces.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the persistent Supabase demo:

1. Create a Supabase project.
2. In **Authentication → Providers → Anonymous Sign-Ins**, enable anonymous sign-ins.
3. Apply the files in `supabase/migrations` in order (or run `supabase db push` after linking the project).
4. Copy `.env.example` to `.env.local` and add the project URL and publishable/anon key.
5. Restart `npm run dev`.

Never add the service-role key to the web application. It bypasses RLS and would silently remove the central guarantee.

Supabase persists the anonymous session in browser storage. Refreshes keep the same workspace. Clearing site data, signing out, using private browsing, or moving to another device creates a different anonymous identity and therefore a fresh copy.

## Sanity-check the boundary

After applying the migrations, use the organization lens to search for `biosecurity` as Aqueduct and then Beacon. Aqueduct receives no match; Beacon finds Jon because only Beacon has the relevant grant. The SQL boundary test is in `supabase/tests/access_boundary.sql`.

## Why there is no AI summary

I deliberately did not add an AI summary. In a system whose entire point is legible, consented access, an opaque generative layer works against the thesis — and record-backed determinism is the right default when the data is sensitive and the records must not be embellished. Restraint is the responsible call here.

## Documentation

- [`docs/product-note.md`](docs/product-note.md) — product thesis, language choices, and deliberate omissions.
- [`docs/rls-notes.md`](docs/rls-notes.md) — how the database enforcement works.
- [`docs/threat-model-lite.md`](docs/threat-model-lite.md) — trust boundaries, leakage, revocation, and audit limits.

## Next, deliberately not built

- Participant-to-identity mapping, invitations, account recovery, and SSO
- ATS imports, deduplication, matching, and pagination
- Participant-managed grant/revoke controls and notifications
- AI summaries or other generated interpretations of sensitive records
- Real or scraped participant data

Those are meaningful systems, not decorative checklist items. They should follow evidence about the real operating constraints rather than be guessed into this slice.
