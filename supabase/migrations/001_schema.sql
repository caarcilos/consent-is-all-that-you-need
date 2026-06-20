create extension if not exists pgcrypto;

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null check (handle ~ '^[a-z0-9-]+$'),
  created_at timestamptz not null default now()
);

create table public.participant_attributes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  key text not null check (key in ('name', 'email', 'location', 'skills', 'seeking', 'notes')),
  value text not null,
  sensitivity text not null default 'standard' check (sensitivity in ('standard', 'sensitive')),
  unique (participant_id, key)
);

create table public.consent_grants (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  attribute_key text not null check (attribute_key in ('*', 'name', 'email', 'location', 'skills', 'seeking', 'notes')),
  basis text not null check (length(trim(basis)) > 0),
  created_at timestamptz not null default now(),
  unique (participant_id, org_id, attribute_key)
);

create table public.access_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id),
  participant_id uuid not null references public.participants(id) on delete cascade,
  attribute_key text not null check (attribute_key in ('name', 'email', 'location', 'skills', 'seeking', 'notes')),
  accessed_at timestamptz not null default now()
);

create index participant_attributes_participant_idx on public.participant_attributes(participant_id);
create index consent_grants_lookup_idx on public.consent_grants(participant_id, org_id, attribute_key);
create index access_log_participant_time_idx on public.access_log(participant_id, accessed_at desc);

comment on table public.participant_attributes is
  'Profile fields are rows so PostgreSQL RLS can enforce field-level consent.';
comment on column public.consent_grants.basis is
  'Human-readable reason shown to the participant and organization.';
comment on table public.access_log is
  'Append-only audit trail surfaced to the participant whose data was read.';
