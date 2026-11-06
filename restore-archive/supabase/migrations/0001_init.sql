create extension if not exists pgcrypto;

create type public.app_role as enum ('client', 'sales_manager', 'content_manager', 'sales_lead', 'partner', 'admin');
create type public.content_status as enum ('draft', 'preview', 'published', 'archived');
create type public.availability_status as enum ('available', 'reserved', 'sold', 'hidden', 'unknown');
create type public.lead_status as enum ('new', 'assigned', 'in_progress', 'qualified', 'won', 'lost', 'duplicate');
create type public.lead_request_type as enum ('manager_call', 'mortgage_consultation', 'apartment_booking', 'layout_request', 'price_request', 'partner_request', 'other');
create type public.promo_status as enum ('draft', 'scheduled', 'active', 'expired', 'archived');
create type public.social_platform as enum ('telegram', 'vk', 'youtube', 'whatsapp', 'instagram', 'site', 'other');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  email text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Пользователь'), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table public.buildings (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  address_label text, order_index integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.layouts (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  rooms integer not null check (rooms >= 0), area_min numeric(8,2), area_max numeric(8,2),
  plan_path text, description text, order_index integer not null default 0,
  published boolean not null default false, is_demo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (area_min is null or area_min > 0), check (area_max is null or area_max >= coalesce(area_min, 0))
);

create table public.apartments (
  id uuid primary key default gen_random_uuid(), building_id uuid not null references public.buildings(id),
  layout_id uuid not null references public.layouts(id), number text not null, floor integer not null,
  rooms integer not null check (rooms >= 0), area numeric(8,2) not null check (area > 0),
  price numeric(14,2), currency text not null default 'RUB',
  availability_status public.availability_status not null default 'unknown',
  availability_updated_at timestamptz, price_updated_at timestamptz,
  is_demo boolean not null default true, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (building_id, number), check (price is null or price >= 0)
);

create table public.price_history (
  id uuid primary key default gen_random_uuid(), apartment_id uuid not null references public.apartments(id) on delete cascade,
  price numeric(14,2) not null check (price >= 0), effective_from timestamptz not null,
  effective_to timestamptz, changed_by uuid references auth.users(id), created_at timestamptz not null default now(),
  check (effective_to is null or effective_to > effective_from)
);

create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, apartment_id)
);

create table public.promos (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  subtitle text, cover_path text, terms text, status public.promo_status not null default 'draft',
  starts_at timestamptz, ends_at timestamptz, cta_label text, cta_request_type public.lead_request_type,
  is_demo boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  excerpt text, cover_path text, body_md text not null default '', tags text[] not null default '{}',
  status public.content_status not null default 'draft', author_id uuid references auth.users(id),
  published_at timestamptz, is_demo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(), platform public.social_platform not null, url text not null,
  label text not null, order_index integer not null default 0, enabled boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (platform, url)
);

create table public.construction_updates (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  body_md text not null default '', report_month date not null, building_id uuid references public.buildings(id),
  media_paths text[] not null default '{}', status public.content_status not null default 'draft',
  published_at timestamptz, is_demo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.consent_versions (
  id uuid primary key default gen_random_uuid(), version text not null unique, body text not null,
  legal_basis text not null, published_at timestamptz, superseded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(), public_reference text not null unique,
  user_id uuid references auth.users(id), name text not null, phone text not null,
  contact_channel text not null, comment text, request_type public.lead_request_type not null,
  source text, apartment_id uuid references public.apartments(id), layout_id uuid references public.layouts(id),
  status public.lead_status not null default 'new', assigned_to uuid references auth.users(id),
  consent_version text not null, consented_at timestamptz not null, dedupe_key text not null,
  payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade,
  event_type text not null, actor uuid references auth.users(id), payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.lead_tasks (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade,
  assignee uuid references auth.users(id), due_at timestamptz, sla_status text not null default 'open',
  completed_at timestamptz, created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(), actor uuid references auth.users(id), action text not null,
  entity_type text not null, entity_id uuid, before jsonb, after jsonb, created_at timestamptz not null default now()
);

create index apartments_public_filter_idx on public.apartments (published, availability_status, rooms, price);
create index apartments_building_idx on public.apartments (building_id);
create index apartments_layout_idx on public.apartments (layout_id);
create index favorites_apartment_idx on public.favorites (apartment_id);
create index promos_status_dates_idx on public.promos (status, starts_at, ends_at);
create index blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
create index construction_status_month_idx on public.construction_updates (status, report_month desc);
create index leads_work_queue_idx on public.leads (status, assigned_to, created_at desc);
create index leads_dedupe_idx on public.leads (dedupe_key, created_at desc);
create index leads_apartment_idx on public.leads (apartment_id);
create index leads_user_idx on public.leads (user_id);
create index lead_events_lead_idx on public.lead_events (lead_id, created_at);
create index price_history_apartment_idx on public.price_history (apartment_id, effective_from desc);
create index audit_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);

create or replace function public.write_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
  v_before jsonb;
  v_after jsonb;
  v_before_clean jsonb;
  v_after_clean jsonb;
begin
  if tg_op = 'DELETE' then
    v_before := to_jsonb(old);
  else
    v_after := to_jsonb(new);
    if tg_op = 'UPDATE' then v_before := to_jsonb(old); end if;
  end if;

  v_entity_id := coalesce(
    (coalesce(v_after, v_before) ->> 'id')::uuid,
    (coalesce(v_after, v_before) ->> 'user_id')::uuid
  );

  if tg_table_name = 'leads' then
    v_before_clean := v_before - 'phone' - 'comment' - 'name' - 'contact_channel';
    v_after_clean := v_after - 'phone' - 'comment' - 'name' - 'contact_channel';
  elsif tg_table_name = 'profiles' then
    v_before_clean := v_before - 'phone' - 'email' - 'display_name';
    v_after_clean := v_after - 'phone' - 'email' - 'display_name';
  elsif tg_table_name = 'consent_versions' then
    v_before_clean := v_before - 'body';
    v_after_clean := v_after - 'body';
  else
    v_before_clean := v_before;
    v_after_clean := v_after;
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, before, after)
  values (auth.uid(), lower(tg_op), tg_table_name, v_entity_id, v_before_clean, v_after_clean);
  return coalesce(new, old);
end;
$$;
revoke all on function public.write_audit() from public;

create trigger apartments_write_audit after insert or update or delete on public.apartments for each row execute procedure public.write_audit();
create trigger leads_write_audit after insert or update or delete on public.leads for each row execute procedure public.write_audit();
create trigger user_roles_write_audit after insert or update or delete on public.user_roles for each row execute procedure public.write_audit();
create trigger promos_write_audit after insert or update or delete on public.promos for each row execute procedure public.write_audit();
create trigger blog_posts_write_audit after insert or update or delete on public.blog_posts for each row execute procedure public.write_audit();

create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger buildings_set_updated_at before update on public.buildings for each row execute procedure public.set_updated_at();
create trigger layouts_set_updated_at before update on public.layouts for each row execute procedure public.set_updated_at();
create trigger apartments_set_updated_at before update on public.apartments for each row execute procedure public.set_updated_at();
create trigger promos_set_updated_at before update on public.promos for each row execute procedure public.set_updated_at();
create trigger blog_posts_set_updated_at before update on public.blog_posts for each row execute procedure public.set_updated_at();
create trigger social_links_set_updated_at before update on public.social_links for each row execute procedure public.set_updated_at();
create trigger construction_updates_set_updated_at before update on public.construction_updates for each row execute procedure public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads for each row execute procedure public.set_updated_at();

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
revoke all on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;

create or replace function public.submit_lead(
  p_name text, p_phone text, p_contact_channel text, p_comment text,
  p_request_type public.lead_request_type, p_source text, p_apartment_id uuid,
  p_layout_id uuid, p_consent_version text, p_consented_at timestamptz,
  p_payload jsonb default '{}'::jsonb
)
returns table(public_reference text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dedupe_key text;
  v_reference text;
  v_lead_id uuid;
begin
  if nullif(trim(p_name), '') is null then raise exception using errcode = 'P0001', message = 'name_required'; end if;
  if nullif(trim(p_phone), '') is null then raise exception using errcode = 'P0001', message = 'phone_required'; end if;
  if length(trim(p_phone)) < 6 or length(trim(p_phone)) > 32 then raise exception using errcode = 'P0001', message = 'phone_invalid'; end if;
  if nullif(trim(p_consent_version), '') is null or p_consented_at is null then raise exception using errcode = 'P0001', message = 'consent_required'; end if;
  if not exists (select 1 from public.consent_versions where version = trim(p_consent_version) and superseded_at is null and published_at is not null and published_at <= p_consented_at) then raise exception using errcode = 'P0001', message = 'consent_version_invalid'; end if;
  if p_apartment_id is not null and not exists (select 1 from public.apartments where id = p_apartment_id) then raise exception using errcode = 'P0001', message = 'apartment_not_found'; end if;
  if p_layout_id is not null and not exists (select 1 from public.layouts where id = p_layout_id) then raise exception using errcode = 'P0001', message = 'layout_not_found'; end if;

  v_dedupe_key := md5(lower(trim(p_phone)) || '|' || p_request_type::text || '|' || coalesce(p_apartment_id::text, '') || '|' || coalesce(p_layout_id::text, ''));
  if exists (select 1 from public.leads where dedupe_key = v_dedupe_key and created_at >= now() - interval '10 minutes') then
    raise exception using errcode = 'P0001', detail = 'duplicate_recent', message = 'lead_validation_failed';
  end if;

  v_reference := 'SC-' || to_char(now(), 'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  insert into public.leads (public_reference, user_id, name, phone, contact_channel, comment, request_type, source, apartment_id, layout_id, consent_version, consented_at, dedupe_key, payload)
  values (v_reference, auth.uid(), trim(p_name), trim(p_phone), trim(p_contact_channel), nullif(trim(p_comment), ''), p_request_type, nullif(trim(p_source), ''), p_apartment_id, p_layout_id, trim(p_consent_version), p_consented_at, v_dedupe_key, coalesce(p_payload, '{}'::jsonb))
  returning id into v_lead_id;
  insert into public.lead_events (lead_id, event_type, actor, payload) values (v_lead_id, 'created', auth.uid(), jsonb_build_object('source', p_source));
  return query select v_reference;
end;
$$;
revoke all on function public.submit_lead(text, text, text, text, public.lead_request_type, text, uuid, uuid, text, timestamptz, jsonb) from public;
grant execute on function public.submit_lead(text, text, text, text, public.lead_request_type, text, uuid, uuid, text, timestamptz, jsonb) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.buildings enable row level security;
alter table public.layouts enable row level security;
alter table public.apartments enable row level security;
alter table public.price_history enable row level security;
alter table public.favorites enable row level security;
alter table public.promos enable row level security;
alter table public.blog_posts enable row level security;
alter table public.social_links enable row level security;
alter table public.construction_updates enable row level security;
alter table public.consent_versions enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.lead_tasks enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy user_roles_self_select on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy user_roles_admin_write on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy buildings_public_read on public.buildings for select to anon, authenticated using (published or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy layouts_public_read on public.layouts for select to anon, authenticated using (published or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy apartments_public_read on public.apartments for select to anon, authenticated using ((published and availability_status <> 'hidden') or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'sales_manager') or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin'));
create policy price_history_staff_read on public.price_history for select to authenticated using (public.has_role(auth.uid(), 'sales_manager') or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy favorites_own_all on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy promos_public_read on public.promos for select to anon, authenticated using (status = 'active' or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy blog_public_read on public.blog_posts for select to anon, authenticated using (status = 'published' or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy social_public_read on public.social_links for select to anon, authenticated using (enabled or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy construction_public_read on public.construction_updates for select to anon, authenticated using (status = 'published' or public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy consent_public_current_read on public.consent_versions for select to anon, authenticated using (superseded_at is null);

create policy content_manager_buildings_write on public.buildings for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_layouts_write on public.layouts for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_apartments_write on public.apartments for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_price_write on public.price_history for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_promos_write on public.promos for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_blog_write on public.blog_posts for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_social_write on public.social_links for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_construction_write on public.construction_updates for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));
create policy content_manager_consent_write on public.consent_versions for all to authenticated using (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'));

create policy leads_owner_read on public.leads for select to authenticated using (user_id = auth.uid());
create policy leads_sales_read on public.leads for select to authenticated using (public.has_role(auth.uid(), 'sales_manager') and (assigned_to = auth.uid() or assigned_to is null) or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin'));
create policy leads_sales_update on public.leads for update to authenticated using ((public.has_role(auth.uid(), 'sales_manager') and (assigned_to = auth.uid() or assigned_to is null)) or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin')) with check ((public.has_role(auth.uid(), 'sales_manager') and (assigned_to = auth.uid() or assigned_to is null)) or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin'));
create policy lead_events_owner_read on public.lead_events for select to authenticated using (exists (select 1 from public.leads l where l.id = lead_id and (l.user_id = auth.uid() or (public.has_role(auth.uid(), 'sales_manager') and (l.assigned_to = auth.uid() or l.assigned_to is null)) or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin'))));
create policy lead_tasks_sales_all on public.lead_tasks for all to authenticated using (exists (select 1 from public.leads l where l.id = lead_id and ((public.has_role(auth.uid(), 'sales_manager') and (l.assigned_to = auth.uid() or l.assigned_to is null)) or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin')))) with check (exists (select 1 from public.leads l where l.id = lead_id and ((public.has_role(auth.uid(), 'sales_manager') and (l.assigned_to = auth.uid() or l.assigned_to is null)) or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin'))));
create policy audit_admin_read on public.audit_log for select to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public) values ('public-media', 'public-media', true), ('internal-media', 'internal-media', false) on conflict (id) do nothing;
create policy public_media_read on storage.objects for select to anon, authenticated using (bucket_id = 'public-media');
create policy staff_media_write on storage.objects for all to authenticated using (bucket_id in ('public-media', 'internal-media') and (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin'))) with check (bucket_id in ('public-media', 'internal-media') and (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'admin')));
create policy internal_media_staff_read on storage.objects for select to authenticated using (bucket_id = 'internal-media' and (public.has_role(auth.uid(), 'content_manager') or public.has_role(auth.uid(), 'sales_manager') or public.has_role(auth.uid(), 'sales_lead') or public.has_role(auth.uid(), 'admin')));

grant usage on schema public to anon, authenticated;
grant select on public.buildings, public.layouts, public.apartments, public.promos, public.blog_posts, public.social_links, public.construction_updates, public.consent_versions to anon, authenticated;
grant select on public.profiles, public.user_roles, public.price_history, public.leads, public.lead_events, public.lead_tasks, public.audit_log to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant update on public.profiles, public.apartments, public.leads, public.lead_tasks to authenticated;
grant insert, update, delete on public.buildings, public.layouts, public.apartments, public.price_history, public.promos, public.blog_posts, public.social_links, public.construction_updates, public.consent_versions, public.user_roles, public.lead_tasks to authenticated;
