# Recovery R0 — отчёт о потерянных артефактах

Дата проверки: 2026-11-07
Checkout: `/home/ubuntu/smartcity`
HEAD: `d1dc329 Add smartphone frame for Reutov concepts`
Ветка: `main`, совпадает с локальным `origin/main` по доступному ref.

## Шаг 1 — точный список потерь

| Файл/директория | Ожидалось | Есть в HEAD | Восстановимо из git? |
|---|---|---:|---:|
| `supabase/config.toml` | Phase 0 Supabase config | Нет | Нет |
| `supabase/migrations/` | SQL migrations Phase 0/1 | Нет | Нет |
| `supabase/seed.sql` | Demo seed | Нет | Нет |
| `supabase/tests/` | phase0/phase1 smoke tests | Нет | Нет |
| `design/v2/index.html` | HTML design index | Нет | Нет |
| `design/v2/catalog.html` | Принятый catalog spec | Нет | Нет |
| `design/v2/detail.html` | Принятый detail spec | Нет | Нет |
| `design/v2/package-1.html` | Принятый Package 1 | Нет | Нет |
| `design/v2/tokens.css` | Официальные design tokens | Нет | Нет |
| `types/db.ts` | Supabase Database types | Нет | Нет |
| `lib/supabase.ts` | Supabase client | Нет | Нет |
| `lib/api/*` | Catalog/favorites/content/leads API | Нет | Нет |
| `lib/storage.ts` | Media/storage resolver | Нет | Нет |
| `app/apartment/[id].tsx` | Detail screen | Нет | Нет |
| `app/lead/success.tsx` | Lead success screen | Нет | Нет |
| `app/(tabs)/favorites.tsx` | Favorites screen | Нет | Нет |
| `components/apartment-card.tsx` | Final horizontal ApartmentCard | Нет | Нет |
| `hooks/use-catalog.ts` | Catalog data hook | Нет | Нет |
| `stores/favorites-store.ts` | Favorites store | Нет | Нет |
| `constants/app-data.ts` | Tokens with `#1C1B1A` | Есть, но старые tokens | Нет принятой версии |
| `app/(tabs)/_layout.tsx` | Floating tab bar | Есть, но старый full-width bar | Нет принятой версии |

### Что осталось в текущем checkout

Сохранился ранний MVP с экранами Home, Catalog, Construction, Profile, Lead и информационными маршрутами. В `constants/app-data.ts` сейчас присутствуют старые значения `background: #484848`, `muted: #8A8887`, `border: #8A8887`; `#1C1B1A` отсутствует. В `app/(tabs)/_layout.tsx` tab bar использует обычный полноширинный стиль с верхней границей, а не floating pill.

## Шаг 2 — Git history / stash / reflog

### `git log --all --oneline | head -50`

```text
d1dc329 Add smartphone frame for Reutov concepts
a472a74 Add one-file Reutov visualization concept
1a36373 Add smartphone device preview
48ed15d Apply Smart City brandbook palette
1647f8e Update home location label to Naukograd
75a4b32 Build Smart City mobile MVP
3c923e6 Initial project scaffold
```

### `git branch -a`

```text
* main
  remotes/origin/main
```

### `git reflog | head -50`

```text
d1dc329 HEAD@{0}: commit: Add smartphone frame for Reutov concepts
a472a74 HEAD@{1}: commit: Add one-file Reutov visualization concept
1a36373 HEAD@{2}: commit: Add smartphone device preview
48ed15d HEAD@{3}: commit: Apply Smart City brandbook palette
1647f8e HEAD@{4}: commit: Update home location label to Naukograd
75a4b32 HEAD@{5}: commit: Build Smart City mobile MVP
3c923e6 HEAD@{6}: commit (initial): Initial project scaffold
```

### `git stash list`

```text
```

Stash пуст.

### `git tag -l`

```text
```

Tags отсутствуют.

### Проверка удалённых refs

Команда `git ls-remote --heads --tags origin` не завершилась чтением refs: в текущем окружении сломан credential-helper runtime:

```text
Cannot find module '/home/ubuntu/.manus-addons/manus-webdev-sha-ab8269ba6ad92e2c/runtime/mcp/git-credential-helper-runtime.mjs'
error: unable to read askpass response from '/bin/false'
fatal: could not read Username for 'https://...artifacts.cloudflare.net/...': terminal prompts disabled
```

Это не даёт оснований считать, что удалённые refs содержат потерянные фазы. Локальные branches, reflog, stash и tags проверены; в них артефактов нет. Локальный `origin/main` ref указывает на тот же `d1dc329`.

## Вывод

Файлы Phase 0, Phase 1, Phase 1.5 и Package 1 не восстановимы из текущего локального Git history/reflog/stash/tags. Кодирование остановлено до получения архива/файлов от пользователя.

Восстановление после получения архива:

1. R0: принять и проверить архив, применить SQL через PostgreSQL harness, проверить типы и smoke tests.
2. R1: восстановить RN из принятого HTML Package 1 и tokens.
3. R2: применить три оставшихся findings — Ionicons, touch targets, loading/empty/error.
4. После каждой принятой фазы выполнить commit, push в `origin/main`, tag и push tags.
