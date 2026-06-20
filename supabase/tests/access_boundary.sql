-- Run after creating an anonymous user and applying the migrations.
-- In the SQL editor, replace TEST_USER_ID with that auth.users.id.
-- The transaction rolls back the temporary workspace and data.

begin;

select set_config(
  'request.jwt.claims',
  '{"sub":"TEST_USER_ID","role":"authenticated","is_anonymous":true}',
  true
);
set local role authenticated;

select public.ensure_demo_workspace();

do $$
declare
  v_workspace_id uuid;
  v_aqueduct uuid;
  v_beacon uuid;
  v_jon uuid;
begin
  select id into v_workspace_id
  from public.demo_workspaces
  where owner_id = auth.uid();

  select id into v_aqueduct
  from public.orgs
  where workspace_id = v_workspace_id and slug = 'aqueduct';

  select id into v_beacon
  from public.orgs
  where workspace_id = v_workspace_id and slug = 'beacon';

  select id into v_jon
  from public.participants
  where workspace_id = v_workspace_id and handle = 'jon-b';

  perform set_config('app.current_org_id', v_aqueduct::text, true);
  if exists (
    select 1 from public.participant_attributes
    where participant_id = v_jon and key = 'skills'
  ) then
    raise exception 'boundary failed: Aqueduct can see Jon skills granted only to Beacon';
  end if;

  perform set_config('app.current_org_id', v_beacon::text, true);
  if not exists (
    select 1 from public.participant_attributes
    where participant_id = v_jon and key = 'skills'
  ) then
    raise exception 'fixture failed: Beacon should see Jon skills';
  end if;

  if exists (
    select 1 from public.participant_attributes
    where participant_id = v_jon and key in ('email', 'notes')
  ) then
    raise exception 'boundary failed: Beacon can see Jon ungranted sensitive fields';
  end if;
end
$$;

rollback;
