# Backend R2 — `notify-lead`

## Статус

Добавлена локально тестируемая Supabase Edge Function `notify-lead`. Она принимает только `POST` Database Webhook для `INSERT` в `public.leads`, проверяет `x-webhook-secret`, форматирует уведомление и отправляет его в Telegram Bot API.

**В этой фазе не выполняются:** deploy в Supabase, подключение Telegram-бота, настройка Database Webhook Dashboard и отправка реальной заявки. Для этого нужен подтверждённый Supabase `project-ref` и отдельное разрешение.

## Файлы

- `supabase/functions/notify-lead/index.ts` — handler, validation, Moscow UTC+3 formatter, HTML escaping, Telegram request.
- `supabase/functions/notify-lead/index.test.ts` — Deno tests с mock `fetch` и проверкой отсутствия PII в логах.
- `supabase/functions/notify-lead/deno.json` — Deno task/import map.
- `supabase/functions/_shared/cors.ts` — CORS headers.
- `supabase/functions/_shared/types.ts` — webhook payload types.
- `.env.example` — только имена и безопасные placeholders.

## Переменные окружения

- `NOTIFY_WEBHOOK_SECRET` — общий секрет Database Webhook и Edge Function.
- `TELEGRAM_BOT_TOKEN` — server-side токен бота.
- `TELEGRAM_CHAT_ID` — server-side chat ID менеджера.
- `EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_ANON_KEY` — публичные клиентские значения приложения; они не используются для хранения Telegram secrets.

Не добавляйте реальные значения в `.env.example`, Git или Expo bundle. `name`, `phone` и `comment` передаются только в HTTPS body Telegram и не попадают в `console.log/error`; безопасная трассировка содержит только `public_reference` и `request_type`.

## Локальная проверка

Требуется Deno:

```bash
deno test --allow-env supabase/functions/notify-lead/index.test.ts
```

Тесты проверяют: валидный webhook и один Telegram fetch; неправильный secret; `UPDATE`; Telegram 500; отсутствие PII в логах; метод не `POST`.

Expo-проверки проекта:

```bash
pnpm check
pnpm lint
pnpm test
```

## Создание Telegram-бота (только при отдельном deploy)

1. Открыть `@BotFather` в Telegram.
2. Выполнить `/newbot`, задать имя и username.
3. Сохранить токен вида `123456:ABC-DEF...` в secret storage, не в Git.
4. Написать боту сообщение.
5. Открыть `https://api.telegram.org/bot<TOKEN>/getUpdates` и взять `result[0].message.chat.id`.
6. Сгенерировать webhook secret: `openssl rand -hex 32`.

## Deploy после подтверждения project-ref

```bash
npx supabase functions deploy notify-lead --project-ref <ref>
npx supabase secrets set \
  NOTIFY_WEBHOOK_SECRET=... \
  TELEGRAM_BOT_TOKEN=... \
  TELEGRAM_CHAT_ID=... \
  --project-ref <ref>
```

Dashboard → Database → Webhooks → Create a new hook:

- Name: `notify-lead-on-insert`
- Table: `public.leads`
- Event: `INSERT`
- Type: HTTP Request
- Method: `POST`
- URL: `https://<project>.supabase.co/functions/v1/notify-lead`
- Header: `x-webhook-secret: <same secret>`

После deploy отправить тестовую заявку только с согласованным тестовым контуром и проверить Telegram delivery/function logs. Не запускать этот раздел автоматически.

## Failure behavior

- не `POST` → `405 method_not_allowed`;
- неверный/отсутствующий secret → `401 unauthorized`;
- не `INSERT leads public` или повреждённое JSON → `400 invalid_payload`;
- Telegram config/API failure → `500 telegram_failed` с безопасным логом.

Telegram HTML values escaped, чтобы имя или комментарий не могли инжектировать markup. Время форматируется в `DD.MM.YYYY HH:mm` по `Europe/Moscow` (UTC+3).
