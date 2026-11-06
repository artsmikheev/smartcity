\set ON_ERROR_STOP on
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000010', 'manager@example.test'),
  ('00000000-0000-0000-0000-000000000011', 'other@example.test'),
  ('00000000-0000-0000-0000-000000000012', 'admin@example.test');
insert into public.user_roles (user_id, role) values
  ('00000000-0000-0000-0000-000000000010', 'sales_manager'),
  ('00000000-0000-0000-0000-000000000012', 'admin');
insert into public.leads (public_reference, user_id, name, phone, contact_channel, request_type, status, assigned_to, consent_version, consented_at, dedupe_key)
values
  ('TEST-MANAGER', null, 'Manager lead', '+79990000110', 'telegram', 'manager_call', 'new', '00000000-0000-0000-0000-000000000010', '2026-11-05-demo', now(), 'test-manager'),
  ('TEST-UNASSIGNED', null, 'Unassigned lead', '+79990000111', 'telegram', 'manager_call', 'new', null, '2026-11-05-demo', now(), 'test-unassigned'),
  ('TEST-OTHER', null, 'Other lead', '+79990000112', 'telegram', 'manager_call', 'new', '00000000-0000-0000-0000-000000000011', '2026-11-05-demo', now(), 'test-other');
insert into public.lead_events (lead_id, event_type)
select id, 'manager_visibility_test' from public.leads where public_reference in ('TEST-MANAGER', 'TEST-UNASSIGNED', 'TEST-OTHER');
insert into public.lead_tasks (lead_id)
select id from public.leads where public_reference in ('TEST-MANAGER', 'TEST-UNASSIGNED', 'TEST-OTHER');

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000010', false);
select count(*) = 2 as manager_events_are_scoped
from public.lead_events e join public.leads l on l.id = e.lead_id
where e.event_type = 'manager_visibility_test';
\gset
\if :manager_events_are_scoped
\else
\echo 'sales_manager lead_events scope failed'
\quit 1
\endif
select count(*) = 2 as manager_tasks_are_scoped
from public.lead_tasks t join public.leads l on l.id = t.lead_id
where l.public_reference in ('TEST-MANAGER', 'TEST-UNASSIGNED');
\gset
\if :manager_tasks_are_scoped
\else
\echo 'sales_manager lead_tasks scope failed'
\quit 1
\endif

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000012', false);
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-000000000011', 'partner');
select count(*) = 1 as admin_role_write_allowed from public.user_roles where user_id = '00000000-0000-0000-0000-000000000011' and role = 'partner';
\gset
\if :admin_role_write_allowed
\else
\echo 'admin user_roles write failed'
\quit 1
\endif
\echo 'PHASE0_RLS_SMOKE_OK'
