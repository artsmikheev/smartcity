-- SmartCity demo seed. Все коммерческие данные помечены is_demo=true.
insert into public.consent_versions (version, body, legal_basis, published_at)
values ('2026-11-05-demo', 'Демо-текст согласия на обратную связь. Финальную редакцию утверждает ответственное лицо проекта.', '152-ФЗ', now())
on conflict (version) do nothing;

insert into public.buildings (slug, title, address_label, order_index, published)
values
  ('k1', 'Корпус 1', 'Наукоград / Реутов — адрес уточняется', 1, true),
  ('k2', 'Корпус 2', 'Наукоград / Реутов — адрес уточняется', 2, true),
  ('k3', 'Корпус 3', 'Наукоград / Реутов — черновой корпус', 3, false)
on conflict (slug) do nothing;

insert into public.layouts (slug, title, rooms, area_min, area_max, description, order_index, published, is_demo)
values
  ('studio-25', 'Студия 25', 0, 25, 25, 'Демонстрационная планировка.', 1, true, true),
  ('one-room-38', '1-комнатная 38', 1, 38, 38, 'Демонстрационная планировка.', 2, true, true),
  ('two-room-55', '2-комнатная 55', 2, 55, 55, 'Демонстрационная планировка.', 3, true, true),
  ('two-room-62', '2-комнатная 62', 2, 62, 62, 'Демонстрационная планировка.', 4, true, true),
  ('three-room-78', '3-комнатная 78', 3, 78, 78, 'Демонстрационная планировка.', 5, true, true)
on conflict (slug) do nothing;

insert into public.apartments (building_id, layout_id, number, floor, rooms, area, price, availability_status, is_demo, published)
select b.id, l.id, x.number, x.floor, l.rooms, coalesce(l.area_min, 25), x.price, x.status::public.availability_status, true, true
from (values
  ('k1', 'studio-25', '101', 1, 8900000::numeric, 'available'),
  ('k1', 'one-room-38', '204', 2, 11900000::numeric, 'reserved'),
  ('k1', 'two-room-55', '305', 3, 15800000::numeric, 'sold'),
  ('k2', 'two-room-62', '412', 4, 17600000::numeric, 'available'),
  ('k2', 'three-room-78', '508', 5, 21900000::numeric, 'reserved'),
  ('k2', 'one-room-38', '603', 6, 12400000::numeric, 'available')
) as x(building_slug, layout_slug, number, floor, price, status)
join public.buildings b on b.slug = x.building_slug
join public.layouts l on l.slug = x.layout_slug
on conflict (building_id, number) do nothing;

insert into public.promos (slug, title, subtitle, terms, status, starts_at, ends_at, cta_label, cta_request_type, is_demo)
values
  ('family-discount', 'Семейный сценарий', 'Демо-акция — условия уточняются.', 'Демо-условия. Не является публичной офертой.', 'active', now(), now() + interval '30 days', 'Узнать условия', 'mortgage_consultation', true),
  ('mortgage-0', 'Ипотечная консультация', 'Демо-карточка без указания банка-партнёра.', 'Банк и условия уточняются командой проекта.', 'active', now(), now() + interval '30 days', 'Получить консультацию', 'mortgage_consultation', true)
on conflict (slug) do update set status = excluded.status, starts_at = excluded.starts_at, ends_at = excluded.ends_at;

insert into public.blog_posts (slug, title, excerpt, body_md, tags, status, published_at, is_demo)
values
  ('project-start', 'Проект собирает материалы в один контур', 'Демо-публикация проекта.', 'Демо-текст. Фактический материал будет добавлен после редакторской проверки.', array['проект'], 'published', now(), true),
  ('city-rhythm', 'Городской ритм и новые планы', 'Демо-публикация о концепции.', 'Демо-текст. Экспертный материал требует подтверждённых источников.', array['концепция'], 'published', now(), true)
on conflict (slug) do nothing;

insert into public.social_links (platform, url, label, order_index, enabled)
values
  ('telegram', 'https://example.com/smartcity-telegram', 'Telegram — демо-ссылка', 1, true),
  ('vk', 'https://example.com/smartcity-vk', 'VK — демо-ссылка', 2, true),
  ('youtube', 'https://example.com/smartcity-youtube', 'YouTube — демо-ссылка', 3, true)
on conflict do nothing;

insert into public.construction_updates (slug, title, body_md, report_month, status, published_at, is_demo)
values
  ('2026-09', 'Сентябрь 2026', 'Демо-отчёт. Процент готовности и фактические этапы не указаны без подтверждения.', '2026-09-01', 'published', now(), true),
  ('2026-10', 'Октябрь 2026', 'Демо-отчёт. Фото и фактические статусы будут добавлены после проверки.', '2026-10-01', 'published', now(), true)
on conflict (slug) do nothing;
