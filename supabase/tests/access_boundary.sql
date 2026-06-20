begin;

set local role anon;

select set_config('app.current_org_id', '10000000-0000-0000-0000-000000000001', true);
do $$
begin
  if exists (
    select 1
    from public.participant_attributes
    where participant_id = '20000000-0000-0000-0000-000000000002'
      and key = 'skills'
  ) then
    raise exception 'boundary failed: Aqueduct can see Jon skills granted only to Beacon';
  end if;
end
$$;

select set_config('app.current_org_id', '10000000-0000-0000-0000-000000000002', true);
do $$
begin
  if not exists (
    select 1
    from public.participant_attributes
    where participant_id = '20000000-0000-0000-0000-000000000002'
      and key = 'skills'
  ) then
    raise exception 'fixture failed: Beacon should see Jon skills';
  end if;

  if exists (
    select 1
    from public.participant_attributes
    where participant_id = '20000000-0000-0000-0000-000000000002'
      and key in ('email', 'notes')
  ) then
    raise exception 'boundary failed: Beacon can see Jon sensitive ungranted fields';
  end if;
end
$$;

rollback;
