create extension if not exists pgcrypto;

create table public.demo_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.demo_workspaces(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(trim(name)) > 0),
  short text not null check (length(short) between 2 and 3),
  unique (workspace_id, slug),
  unique (id, workspace_id)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.demo_workspaces(id) on delete cascade,
  handle text not null check (handle ~ '^[a-z0-9-]+$'),
  initials text not null check (length(initials) between 1 and 3),
  tone text not null check (tone in ('coral', 'blue', 'mint', 'amber', 'violet', 'green', 'pink', 'teal')),
  created_at timestamptz not null default now(),
  unique (workspace_id, handle),
  unique (id, workspace_id)
);

create table public.participant_attributes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  participant_id uuid not null,
  key text not null check (key in ('name', 'email', 'location', 'skills', 'seeking', 'notes')),
  value text not null,
  sensitivity text not null default 'standard' check (sensitivity in ('standard', 'sensitive')),
  foreign key (participant_id, workspace_id)
    references public.participants(id, workspace_id) on delete cascade,
  unique (workspace_id, participant_id, key)
);

create table public.consent_grants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  participant_id uuid not null,
  org_id uuid not null,
  attribute_key text not null check (attribute_key in ('*', 'name', 'email', 'location', 'skills', 'seeking', 'notes')),
  basis text not null check (length(trim(basis)) > 0),
  created_at timestamptz not null default now(),
  foreign key (participant_id, workspace_id)
    references public.participants(id, workspace_id) on delete cascade,
  foreign key (org_id, workspace_id)
    references public.orgs(id, workspace_id) on delete cascade,
  unique (workspace_id, participant_id, org_id, attribute_key)
);

create table public.access_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  org_id uuid not null,
  participant_id uuid not null,
  attribute_key text not null check (attribute_key in ('name', 'email', 'location', 'skills', 'seeking', 'notes')),
  accessed_at timestamptz not null default now(),
  foreign key (org_id, workspace_id)
    references public.orgs(id, workspace_id) on delete cascade,
  foreign key (participant_id, workspace_id)
    references public.participants(id, workspace_id) on delete cascade
);

create index participant_attributes_participant_idx
  on public.participant_attributes(workspace_id, participant_id);
create index consent_grants_lookup_idx
  on public.consent_grants(workspace_id, participant_id, org_id, attribute_key);
create index access_log_participant_time_idx
  on public.access_log(workspace_id, participant_id, accessed_at desc);

comment on table public.demo_workspaces is
  'One isolated, resettable synthetic dataset per anonymous or permanent Supabase user.';
comment on table public.participant_attributes is
  'Profile fields are rows so PostgreSQL RLS can enforce field-level consent.';
comment on table public.access_log is
  'Append-only audit trail surfaced to the participant whose data was read.';
