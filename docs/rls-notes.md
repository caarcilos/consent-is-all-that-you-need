# RLS notes

## Field-level consent as a row-level rule

PostgreSQL RLS cannot hide individual columns from an otherwise-readable row. `consent-lens` therefore stores profile attributes as individual rows. A grant for `skills` authorizes the `skills` row; no grant means that row never reaches the caller.

The central policy checks for a matching `(participant_id, org_id, attribute_key)` grant or a wildcard grant:

```sql
exists (
  select 1
  from consent_grants g
  where g.participant_id = participant_attributes.participant_id
    and g.org_id = current_setting('app.current_org_id', true)::uuid
    and (g.attribute_key = participant_attributes.key or g.attribute_key = '*')
)
```

The actual migration uses `nullif(..., '')::uuid` so a missing setting fails closed instead of producing a cast error.

## Request context

`search_pool` resolves a supplied organization slug, sets `app.current_org_id` transaction-locally, queries the pool, and appends access-log records in one RPC. The function is `SECURITY INVOKER`: it does not acquire owner privileges, so the caller remains subject to RLS.

In a production application, a trusted server route must derive the organization from the authenticated session. Accepting an arbitrary organization selector is acceptable only for this synthetic demonstration.

The participant RPC follows the same context pattern. Its handle selector is explicitly demo-only; production should map `auth.uid()` to one participant and refuse caller-supplied identity context.

## Database truth, presentational mirror

`lib/policy.ts` and `lib/visibleProfile.ts` exist so the UI can show stable field slots and locked placeholders. They are not permission checks and must never receive a wide, unfiltered profile from a privileged query.

The safe sequence is:

1. A request establishes verified tenant context.
2. A query runs as `anon` or `authenticated`.
3. RLS removes unauthorized attribute rows.
4. UI code places returned rows into a six-field presentation model.

If step 3 were replaced by client filtering, the demo’s central claim would be false.

## The service-role footgun

Supabase’s service-role key bypasses RLS. It is useful for tightly controlled administrative jobs and destructive in this read path. The key must never be exposed to the browser, added to Vercel’s public variables, or used to “fix” a query returning too few rows.

When a caller sees too little, inspect the identity context and policy. Do not widen the caller’s database power.

## Why search respects consent

The search predicate runs against the `visible` CTE, whose `participant_attributes` rows have already passed RLS. A hidden email or note is absent from the search relation, so it cannot produce a match, score, facet, count, or ordering signal.

This property can be lost if search is moved to an external index built from unrestricted data. Any future search service needs equivalent per-document/per-field authorization and revocation semantics, or should index only the already-public subset.

## Revocation

A grant is data. Revocation is deletion of that grant. The next transaction no longer satisfies the RLS predicate, so the attribute disappears immediately from reads and search. Existing access-log history remains visible to the participant.
