# Threat model, lite

## Trust boundaries

The browser and its organization/participant selectors are untrusted. A trusted server must bind request context to an authenticated identity before invoking database RPCs.

Postgres RLS is the authorization boundary. UI locks, disabled controls, and TypeScript policy helpers are explanatory affordances, never gates.

## What RLS protects—and what it does not

RLS prevents an ordinary `anon` or `authenticated` query from returning attribute rows without a matching consent grant. It also fails closed when no tenant context is set.

It does not protect data copied elsewhere, screenshots, recruiter notes created after a read, database owners, or privileged operational tooling. Governance and retention controls remain necessary.

## Service-role footgun

The Supabase service-role key bypasses RLS. Leaking it to a client or using it in the normal read path collapses all tenant isolation.

The application should hold only the anon key. Exceptional privileged jobs need separate code paths, narrow purpose, logging, and ideally a different runtime identity.

## Search-side leakage

Counts, autocomplete, ranking, error messages, and timing can leak hidden information even when values are not displayed. Search therefore runs only over attribute rows that already passed RLS.

Moving search to a global external index would reopen this risk. The index must support field-level authorization and prompt deletion, or receive only non-sensitive public material.

## Revocation timing

Deleting a grant changes the next database read immediately. A response already delivered, browser cache, export, screenshot, or downstream copy cannot be recalled by RLS.

Production responses should use restrictive caching headers, and export/download features need separate consent and retention decisions.

## Audit and repudiation

The search RPC writes one access-log row per returned attribute in the same transaction. Participants can inspect that append-only trail through their own RLS context.

An access log proves that the system recorded a read, not what a human noticed or did afterward. Production would add actor identity, request IDs, purpose, immutable retention, and monitoring for failed or bypassed logging.

## Synthetic-data caveat

Every person, organization, email address, note, and access event in this repository is fictional. The `.example.test` addresses are deliberately non-routable.

Synthetic data prevents this demo from becoming an accidental source of personal information. It does not substitute for a privacy review before processing real records.
