-- Existing demo workspaces may contain the starter audit events that were
-- previously inserted with the synthetic seed. From this point on, the audit
-- trail starts empty and is populated only by real organization-view actions.
truncate table public.access_log;
