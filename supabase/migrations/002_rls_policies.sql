alter table public.orgs enable row level security;
alter table public.participants enable row level security;
alter table public.participant_attributes enable row level security;
alter table public.consent_grants enable row level security;
alter table public.access_log enable row level security;

create policy "orgs are directory data"
on public.orgs for select
to anon, authenticated
using (true);

create policy "org sees participants with at least one grant"
on public.participants for select
to anon, authenticated
using (
  id = nullif(current_setting('app.current_participant_id', true), '')::uuid
  or exists (
    select 1
    from public.consent_grants g
    where g.participant_id = participants.id
      and g.org_id = nullif(current_setting('app.current_org_id', true), '')::uuid
  )
);

create policy "org reads only granted attribute rows"
on public.participant_attributes for select
to anon, authenticated
using (
  participant_id = nullif(current_setting('app.current_participant_id', true), '')::uuid
  or exists (
    select 1
    from public.consent_grants g
    where g.participant_id = participant_attributes.participant_id
      and g.org_id = nullif(current_setting('app.current_org_id', true), '')::uuid
      and (g.attribute_key = participant_attributes.key or g.attribute_key = '*')
  )
);

create policy "participant or current org reads relevant grants"
on public.consent_grants for select
to anon, authenticated
using (
  participant_id = nullif(current_setting('app.current_participant_id', true), '')::uuid
  or org_id = nullif(current_setting('app.current_org_id', true), '')::uuid
);

create policy "participant reads own access log"
on public.access_log for select
to anon, authenticated
using (
  participant_id = nullif(current_setting('app.current_participant_id', true), '')::uuid
);

create policy "current org appends its own access log"
on public.access_log for insert
to anon, authenticated
with check (
  org_id = nullif(current_setting('app.current_org_id', true), '')::uuid
  and exists (
    select 1
    from public.consent_grants g
    where g.participant_id = access_log.participant_id
      and g.org_id = access_log.org_id
      and (g.attribute_key = access_log.attribute_key or g.attribute_key = '*')
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.orgs, public.participants, public.participant_attributes, public.consent_grants to anon, authenticated;
grant select, insert on public.access_log to anon, authenticated;

-- One RPC keeps org context, RLS-filtered search, and audit writes in one transaction.
-- It is SECURITY INVOKER on purpose: the caller remains subject to RLS.
create or replace function public.search_pool(p_org_slug text, p_query text default '')
returns table (
  participant_id uuid,
  handle text,
  visible_attributes jsonb
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select id into strict v_org_id from public.orgs where slug = p_org_slug;
  perform set_config('app.current_org_id', v_org_id::text, true);

  return query
  with visible as materialized (
    select p.id as participant_id, p.handle, a.key, a.value, a.sensitivity
    from public.participants p
    join public.participant_attributes a on a.participant_id = p.id
  ),
  matches as materialized (
    select distinct v.participant_id
    from visible v
    where nullif(trim(p_query), '') is null
       or v.value ilike '%' || replace(replace(p_query, '%', '\%'), '_', '\_') || '%' escape '\'
  ),
  logged as (
    insert into public.access_log (org_id, participant_id, attribute_key)
    select v_org_id, v.participant_id, v.key
    from visible v
    join matches m using (participant_id)
    returning 1
  )
  select
    v.participant_id,
    v.handle,
    jsonb_object_agg(
      v.key,
      jsonb_build_object('value', v.value, 'sensitivity', v.sensitivity)
      order by v.key
    ) as visible_attributes
  from visible v
  join matches m using (participant_id)
  cross join lateral (select count(*) from logged) audit_barrier
  group by v.participant_id, v.handle
  order by v.handle;
end;
$$;

-- Demo-only identity selector. Real authentication should derive this context from
-- auth.uid(), not accept a participant handle supplied by the client.
create or replace function public.participant_glass_box(p_handle text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_participant_id uuid;
  v_result jsonb;
begin
  select id into strict v_participant_id from public.participants where handle = p_handle;
  perform set_config('app.current_participant_id', v_participant_id::text, true);

  select jsonb_build_object(
    'participant', (
      select jsonb_build_object(
        'id', p.id,
        'handle', p.handle,
        'attributes', (
          select jsonb_object_agg(a.key, jsonb_build_object('value', a.value, 'sensitivity', a.sensitivity))
          from public.participant_attributes a
          where a.participant_id = p.id
        )
      )
      from public.participants p
      where p.id = v_participant_id
    ),
    'grants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'org_id', g.org_id,
        'org_name', o.name,
        'attribute_key', g.attribute_key,
        'basis', g.basis,
        'created_at', g.created_at
      ) order by o.name, g.attribute_key)
      from public.consent_grants g
      join public.orgs o on o.id = g.org_id
      where g.participant_id = v_participant_id
    ), '[]'::jsonb),
    'access_log', coalesce((
      select jsonb_agg(jsonb_build_object(
        'org_id', l.org_id,
        'org_name', o.name,
        'attribute_key', l.attribute_key,
        'accessed_at', l.accessed_at
      ) order by l.accessed_at desc)
      from public.access_log l
      join public.orgs o on o.id = l.org_id
      where l.participant_id = v_participant_id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.search_pool(text, text) to anon, authenticated;
grant execute on function public.participant_glass_box(text) to anon, authenticated;
