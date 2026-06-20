alter table public.demo_workspaces enable row level security;
alter table public.orgs enable row level security;
alter table public.participants enable row level security;
alter table public.participant_attributes enable row level security;
alter table public.consent_grants enable row level security;
alter table public.access_log enable row level security;

create policy "users read their workspace"
on public.demo_workspaces for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "users create their workspace"
on public.demo_workspaces for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "users manage their organizations"
on public.orgs for all
to authenticated
using (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
)
with check (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
);

create policy "users manage their synthetic participants"
on public.participants for all
to authenticated
using (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
)
with check (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
);

-- Attribute SELECT is deliberately narrower than workspace ownership. The request
-- must establish either an org lens or one participant lens. No context fails closed.
create policy "context reads only permitted attribute rows"
on public.participant_attributes for select
to authenticated
using (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
  and (
    (
      participant_id =
        nullif(current_setting('app.current_participant_id', true), '')::uuid
    )
    or exists (
      select 1
      from public.consent_grants g
      where g.workspace_id = participant_attributes.workspace_id
        and g.participant_id = participant_attributes.participant_id
        and g.org_id =
          nullif(current_setting('app.current_org_id', true), '')::uuid
        and (
          g.attribute_key = participant_attributes.key
          or g.attribute_key = '*'
        )
    )
  )
);

create policy "users manage grants in their workspace"
on public.consent_grants for all
to authenticated
using (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
)
with check (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
);

create policy "users read their workspace audit trail"
on public.access_log for select
to authenticated
using (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
);

create policy "current org logs only consented reads"
on public.access_log for insert
to authenticated
with check (
  workspace_id in (
    select id from public.demo_workspaces
    where owner_id = (select auth.uid())
  )
  and org_id =
    nullif(current_setting('app.current_org_id', true), '')::uuid
  and exists (
    select 1
    from public.consent_grants g
    where g.workspace_id = access_log.workspace_id
      and g.participant_id = access_log.participant_id
      and g.org_id = access_log.org_id
      and (
        g.attribute_key = access_log.attribute_key
        or g.attribute_key = '*'
      )
  )
);

grant usage on schema public to authenticated;
grant select, insert on public.demo_workspaces to authenticated;
grant select on public.orgs, public.participants, public.participant_attributes to authenticated;
grant select on public.consent_grants to authenticated;
grant select, insert on public.access_log to authenticated;
