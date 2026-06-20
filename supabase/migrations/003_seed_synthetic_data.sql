create or replace function public.seed_demo_workspace(p_workspace_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  aqueduct uuid := gen_random_uuid();
  beacon uuid := gen_random_uuid();
  lattice uuid := gen_random_uuid();
  maya uuid := gen_random_uuid();
  jon uuid := gen_random_uuid();
  aisha uuid := gen_random_uuid();
  leo uuid := gen_random_uuid();
  nora uuid := gen_random_uuid();
  sam uuid := gen_random_uuid();
  elena uuid := gen_random_uuid();
  dev uuid := gen_random_uuid();
begin
  insert into public.orgs (id, workspace_id, slug, name, short) values
    (aqueduct, p_workspace_id, 'aqueduct', 'Aqueduct Research', 'AR'),
    (beacon, p_workspace_id, 'beacon', 'Beacon Policy', 'BP'),
    (lattice, p_workspace_id, 'lattice', 'Lattice Labs', 'LL');

  insert into public.participants (id, workspace_id, handle, initials, tone) values
    (maya, p_workspace_id, 'maya-k', 'MK', 'coral'),
    (jon, p_workspace_id, 'jon-b', 'JB', 'blue'),
    (aisha, p_workspace_id, 'aisha-r', 'AR', 'mint'),
    (leo, p_workspace_id, 'leo-s', 'LS', 'amber'),
    (nora, p_workspace_id, 'nora-v', 'NV', 'violet'),
    (sam, p_workspace_id, 'sam-t', 'ST', 'green'),
    (elena, p_workspace_id, 'elena-p', 'EP', 'pink'),
    (dev, p_workspace_id, 'dev-c', 'DC', 'teal');

  insert into public.participant_attributes
    (workspace_id, participant_id, key, value, sensitivity)
  values
    (p_workspace_id,maya,'name','Maya K.','standard'),
    (p_workspace_id,maya,'email','maya.k@example.test','sensitive'),
    (p_workspace_id,maya,'location','London, UK','standard'),
    (p_workspace_id,maya,'skills','Technical governance · evaluations · Python','standard'),
    (p_workspace_id,maya,'seeking','Research engineering roles','standard'),
    (p_workspace_id,maya,'notes','Prefers mission-focused teams under 80 people.','sensitive'),
    (p_workspace_id,jon,'name','Jon Bell','standard'),
    (p_workspace_id,jon,'email','jon.b@example.test','sensitive'),
    (p_workspace_id,jon,'location','Berlin, DE','standard'),
    (p_workspace_id,jon,'skills','Policy research · biosecurity · writing','standard'),
    (p_workspace_id,jon,'seeking','Policy fellowships','standard'),
    (p_workspace_id,jon,'notes','Available from September; open to relocation.','sensitive'),
    (p_workspace_id,aisha,'name','Aisha Rahman','standard'),
    (p_workspace_id,aisha,'email','aisha.r@example.test','sensitive'),
    (p_workspace_id,aisha,'location','Nairobi, KE','standard'),
    (p_workspace_id,aisha,'skills','Operations · grants · community building','standard'),
    (p_workspace_id,aisha,'seeking','Chief of staff or program roles','standard'),
    (p_workspace_id,aisha,'notes','Strong preference for distributed teams.','sensitive'),
    (p_workspace_id,leo,'name','Leo Santos','standard'),
    (p_workspace_id,leo,'email','leo.s@example.test','sensitive'),
    (p_workspace_id,leo,'location','Madrid, ES','standard'),
    (p_workspace_id,leo,'skills','ML engineering · interpretability · Rust','standard'),
    (p_workspace_id,leo,'seeking','Applied research roles','standard'),
    (p_workspace_id,leo,'notes','Shared directly after a conference conversation.','sensitive'),
    (p_workspace_id,nora,'name','Nora V.','standard'),
    (p_workspace_id,nora,'email','nora.v@example.test','sensitive'),
    (p_workspace_id,nora,'location','Toronto, CA','standard'),
    (p_workspace_id,nora,'skills','Forecasting · statistics · facilitation','standard'),
    (p_workspace_id,nora,'seeking','Short-term research contracts','standard'),
    (p_workspace_id,nora,'notes','Currently balancing part-time study.','sensitive'),
    (p_workspace_id,sam,'name','Sam Taylor','standard'),
    (p_workspace_id,sam,'email','sam.t@example.test','sensitive'),
    (p_workspace_id,sam,'location','Boston, US','standard'),
    (p_workspace_id,sam,'skills','Security engineering · threat modeling · Go','standard'),
    (p_workspace_id,sam,'seeking','Senior individual-contributor roles','standard'),
    (p_workspace_id,sam,'notes','Does not want current employer contacted.','sensitive'),
    (p_workspace_id,elena,'name','Elena Petrova','standard'),
    (p_workspace_id,elena,'email','elena.p@example.test','sensitive'),
    (p_workspace_id,elena,'location','Prague, CZ','standard'),
    (p_workspace_id,elena,'skills','Program management · multilingual comms','standard'),
    (p_workspace_id,elena,'seeking','Operations leadership','standard'),
    (p_workspace_id,elena,'notes','Prefers a four-day week.','sensitive'),
    (p_workspace_id,dev,'name','Dev Chen','standard'),
    (p_workspace_id,dev,'email','dev.c@example.test','sensitive'),
    (p_workspace_id,dev,'location','Singapore','standard'),
    (p_workspace_id,dev,'skills','Data engineering · privacy · TypeScript','standard'),
    (p_workspace_id,dev,'seeking','Infrastructure or data roles','standard'),
    (p_workspace_id,dev,'notes','Happy to advise before considering a move.','sensitive');

  insert into public.consent_grants
    (workspace_id, participant_id, org_id, attribute_key, basis)
  values
    (p_workspace_id,maya,aqueduct,'*','Opted in to all safety orgs'),
    (p_workspace_id,maya,beacon,'*','Opted in to all safety orgs'),
    (p_workspace_id,maya,lattice,'*','Opted in to all safety orgs'),
    (p_workspace_id,jon,beacon,'name','Shared non-sensitive profile'),
    (p_workspace_id,jon,beacon,'location','Shared non-sensitive profile'),
    (p_workspace_id,jon,beacon,'skills','Shared non-sensitive profile'),
    (p_workspace_id,jon,beacon,'seeking','Shared non-sensitive profile'),
    (p_workspace_id,aisha,aqueduct,'name','Applied to this org'),
    (p_workspace_id,aisha,aqueduct,'email','Applied to this org'),
    (p_workspace_id,aisha,aqueduct,'skills','Applied to this org'),
    (p_workspace_id,aisha,aqueduct,'seeking','Applied to this org'),
    (p_workspace_id,leo,lattice,'name','Shared directly with recruiter'),
    (p_workspace_id,leo,lattice,'email','Shared directly with recruiter'),
    (p_workspace_id,leo,lattice,'location','Shared directly with recruiter'),
    (p_workspace_id,leo,lattice,'skills','Shared directly with recruiter'),
    (p_workspace_id,nora,aqueduct,'name','Open call opt-in'),
    (p_workspace_id,nora,aqueduct,'location','Open call opt-in'),
    (p_workspace_id,nora,aqueduct,'skills','Open call opt-in'),
    (p_workspace_id,nora,aqueduct,'seeking','Open call opt-in'),
    (p_workspace_id,nora,beacon,'name','Open call opt-in'),
    (p_workspace_id,nora,beacon,'location','Open call opt-in'),
    (p_workspace_id,nora,beacon,'skills','Open call opt-in'),
    (p_workspace_id,nora,beacon,'seeking','Open call opt-in'),
    (p_workspace_id,sam,aqueduct,'name','Applied to this org'),
    (p_workspace_id,sam,aqueduct,'email','Applied to this org'),
    (p_workspace_id,sam,aqueduct,'location','Applied to this org'),
    (p_workspace_id,sam,aqueduct,'skills','Applied to this org'),
    (p_workspace_id,sam,aqueduct,'seeking','Applied to this org'),
    (p_workspace_id,elena,beacon,'name','Public field'),
    (p_workspace_id,elena,beacon,'location','Public field'),
    (p_workspace_id,elena,beacon,'skills','Public field'),
    (p_workspace_id,elena,beacon,'seeking','Public field'),
    (p_workspace_id,dev,lattice,'name','Shared for infrastructure roles'),
    (p_workspace_id,dev,lattice,'location','Shared for infrastructure roles'),
    (p_workspace_id,dev,lattice,'skills','Shared for infrastructure roles'),
    (p_workspace_id,dev,lattice,'seeking','Shared for infrastructure roles'),
    (p_workspace_id,dev,lattice,'notes','Shared for infrastructure roles'),
    (p_workspace_id,dev,aqueduct,'name','Shared directly with recruiter'),
    (p_workspace_id,dev,aqueduct,'skills','Shared directly with recruiter');

  insert into public.access_log
    (workspace_id, org_id, participant_id, attribute_key, accessed_at)
  values
    (p_workspace_id,aqueduct,maya,'email', now() - interval '2 minutes'),
    (p_workspace_id,beacon,maya,'skills', now() - interval '24 minutes'),
    (p_workspace_id,aqueduct,maya,'notes', now() - interval '74 minutes'),
    (p_workspace_id,lattice,maya,'seeking', now() - interval '26 hours'),
    (p_workspace_id,beacon,jon,'skills', now() - interval '8 minutes'),
    (p_workspace_id,aqueduct,aisha,'email', now() - interval '19 minutes'),
    (p_workspace_id,lattice,leo,'skills', now() - interval '49 minutes'),
    (p_workspace_id,lattice,dev,'notes', now() - interval '2 days');
end;
$$;

revoke all on function public.seed_demo_workspace(uuid) from public;

create or replace function public.ensure_demo_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.demo_workspaces (owner_id)
  values (v_user_id)
  on conflict (owner_id) do nothing
  returning id into v_workspace_id;

  if v_workspace_id is not null then
    perform public.seed_demo_workspace(v_workspace_id);
  else
    select id into strict v_workspace_id
    from public.demo_workspaces
    where owner_id = v_user_id;
  end if;

  return v_workspace_id;
end;
$$;

create or replace function public.reset_demo_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
begin
  select id into strict v_workspace_id
  from public.demo_workspaces
  where owner_id = auth.uid();

  delete from public.orgs where workspace_id = v_workspace_id;
  delete from public.participants where workspace_id = v_workspace_id;
  perform public.seed_demo_workspace(v_workspace_id);
  return v_workspace_id;
end;
$$;

create or replace function public.demo_directory()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_result jsonb;
begin
  select id into strict v_workspace_id
  from public.demo_workspaces
  where owner_id = auth.uid();

  select jsonb_build_object(
    'workspace_id', v_workspace_id,
    'orgs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id,
        'slug', o.slug,
        'name', o.name,
        'short', o.short
      ) order by o.slug)
      from public.orgs o
      where o.workspace_id = v_workspace_id
    ), '[]'::jsonb),
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'handle', p.handle,
        'initials', p.initials,
        'tone', p.tone,
        'name', a.value
      ) order by p.handle)
      from public.participants p
      join public.participant_attributes a
        on a.participant_id = p.id
       and a.key = 'name'
      where p.workspace_id = v_workspace_id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.search_pool(
  p_org_id uuid,
  p_query text default ''
)
returns table (
  participant_id uuid,
  handle text,
  initials text,
  tone text,
  visible_attributes jsonb
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_workspace_id uuid;
begin
  select o.workspace_id into strict v_workspace_id
  from public.orgs o
  join public.demo_workspaces w on w.id = o.workspace_id
  where o.id = p_org_id
    and w.owner_id = auth.uid();

  perform set_config('app.current_org_id', p_org_id::text, true);
  perform set_config('app.current_participant_id', '', true);

  insert into public.access_log
    (workspace_id, org_id, participant_id, attribute_key)
  select
    v_workspace_id,
    p_org_id,
    p.id,
    a.key
  from public.participants p
  join public.participant_attributes a on a.participant_id = p.id
  where p.workspace_id = v_workspace_id
    and (
      nullif(trim(p_query), '') is null
      or exists (
        select 1
        from public.participant_attributes match_attribute
        where match_attribute.participant_id = p.id
          and match_attribute.value ilike
            '%' || replace(replace(p_query, '%', '\%'), '_', '\_') || '%'
            escape '\'
      )
    );

  return query
  select
    p.id,
    p.handle,
    p.initials,
    p.tone,
    jsonb_object_agg(
      a.key,
      jsonb_build_object(
        'value', a.value,
        'sensitivity', a.sensitivity
      )
      order by a.key
    )
  from public.participants p
  join public.participant_attributes a on a.participant_id = p.id
  where p.workspace_id = v_workspace_id
    and (
      nullif(trim(p_query), '') is null
      or exists (
        select 1
        from public.participant_attributes match_attribute
        where match_attribute.participant_id = p.id
          and match_attribute.value ilike
            '%' || replace(replace(p_query, '%', '\%'), '_', '\_') || '%'
            escape '\'
      )
    )
  group by p.id, p.handle, p.initials, p.tone
  order by p.handle;
end;
$$;

create or replace function public.participant_glass_box(p_participant_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_result jsonb;
begin
  select p.workspace_id into strict v_workspace_id
  from public.participants p
  join public.demo_workspaces w on w.id = p.workspace_id
  where p.id = p_participant_id
    and w.owner_id = auth.uid();

  perform set_config('app.current_participant_id', p_participant_id::text, true);
  perform set_config('app.current_org_id', '', true);

  select jsonb_build_object(
    'participant', (
      select jsonb_build_object(
        'id', p.id,
        'handle', p.handle,
        'initials', p.initials,
        'tone', p.tone,
        'attributes', (
          select jsonb_object_agg(
            a.key,
            jsonb_build_object(
              'value', a.value,
              'sensitivity', a.sensitivity
            )
          )
          from public.participant_attributes a
          where a.participant_id = p.id
        )
      )
      from public.participants p
      where p.id = p_participant_id
    ),
    'grants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id,
        'org_id', g.org_id,
        'attribute_key', g.attribute_key,
        'basis', g.basis
      ) order by g.org_id, g.attribute_key)
      from public.consent_grants g
      where g.participant_id = p_participant_id
    ), '[]'::jsonb),
    'access_log', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id,
        'org_id', l.org_id,
        'attribute_key', l.attribute_key,
        'accessed_at', l.accessed_at
      ) order by l.accessed_at desc)
      from public.access_log l
      where l.participant_id = p_participant_id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.update_participant_attribute(
  p_participant_id uuid,
  p_key text,
  p_value text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_key not in ('name', 'email', 'location', 'skills', 'seeking', 'notes') then
    raise exception 'Unknown attribute key';
  end if;

  update public.participant_attributes a
  set value = p_value
  from public.demo_workspaces w
  where a.participant_id = p_participant_id
    and a.key = p_key
    and w.id = a.workspace_id
    and w.owner_id = auth.uid();

  if not found then
    raise exception 'Participant attribute not found';
  end if;
end;
$$;

create or replace function public.set_consent_grant(
  p_participant_id uuid,
  p_org_id uuid,
  p_attribute_key text,
  p_basis text,
  p_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_wildcard_basis text;
begin
  if p_attribute_key not in ('name', 'email', 'location', 'skills', 'seeking', 'notes') then
    raise exception 'Unknown attribute key';
  end if;

  select p.workspace_id into strict v_workspace_id
  from public.participants p
  join public.orgs o
    on o.workspace_id = p.workspace_id
   and o.id = p_org_id
  join public.demo_workspaces w on w.id = p.workspace_id
  where p.id = p_participant_id
    and w.owner_id = auth.uid();

  if p_enabled then
    insert into public.consent_grants
      (workspace_id, participant_id, org_id, attribute_key, basis)
    values
      (v_workspace_id, p_participant_id, p_org_id, p_attribute_key, trim(p_basis))
    on conflict (workspace_id, participant_id, org_id, attribute_key)
    do update set basis = excluded.basis;
  else
    select basis into v_wildcard_basis
    from public.consent_grants
    where workspace_id = v_workspace_id
      and participant_id = p_participant_id
      and org_id = p_org_id
      and attribute_key = '*';

    if v_wildcard_basis is not null then
      delete from public.consent_grants
      where workspace_id = v_workspace_id
        and participant_id = p_participant_id
        and org_id = p_org_id
        and attribute_key = '*';

      insert into public.consent_grants
        (workspace_id, participant_id, org_id, attribute_key, basis)
      select
        v_workspace_id,
        p_participant_id,
        p_org_id,
        key,
        v_wildcard_basis
      from unnest(array['name','email','location','skills','seeking','notes']) key
      where key <> p_attribute_key;
    else
      delete from public.consent_grants
      where workspace_id = v_workspace_id
        and participant_id = p_participant_id
        and org_id = p_org_id
        and attribute_key = p_attribute_key;
    end if;
  end if;
end;
$$;

create or replace function public.update_demo_org_name(
  p_org_id uuid,
  p_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(trim(p_name)) = 0 then
    raise exception 'Organization name is required';
  end if;

  update public.orgs o
  set name = trim(p_name)
  from public.demo_workspaces w
  where o.id = p_org_id
    and w.id = o.workspace_id
    and w.owner_id = auth.uid();

  if not found then
    raise exception 'Organization not found';
  end if;
end;
$$;

revoke all on function public.ensure_demo_workspace() from public;
revoke all on function public.reset_demo_workspace() from public;
revoke all on function public.demo_directory() from public;
revoke all on function public.search_pool(uuid, text) from public;
revoke all on function public.participant_glass_box(uuid) from public;
revoke all on function public.update_participant_attribute(uuid, text, text) from public;
revoke all on function public.set_consent_grant(uuid, uuid, text, text, boolean) from public;
revoke all on function public.update_demo_org_name(uuid, text) from public;

grant execute on function public.ensure_demo_workspace() to authenticated;
grant execute on function public.reset_demo_workspace() to authenticated;
grant execute on function public.demo_directory() to authenticated;
grant execute on function public.search_pool(uuid, text) to authenticated;
grant execute on function public.participant_glass_box(uuid) to authenticated;
grant execute on function public.update_participant_attribute(uuid, text, text) to authenticated;
grant execute on function public.set_consent_grant(uuid, uuid, text, text, boolean) to authenticated;
grant execute on function public.update_demo_org_name(uuid, text) to authenticated;
