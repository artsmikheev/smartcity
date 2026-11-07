

## Recovery R1.5 — Detail CTA + notify-lead Edge Function (07.11.2026)

Основание: `pasted_content_21.txt`, предыдущий remote SHA `c9df63f`. В Detail удалена только контентная CTA; оставлен `SPACING.xxxl` spacer 32px, sticky CTA сохранена. Actual Expo Web capture подтвердил одну видимую `detail-sticky-cta` 335×52 внутри sticky 375×104.

Добавлена локальная Supabase Edge Function `supabase/functions/notify-lead` для INSERT webhook leads → Telegram. Secret validation предшествует payload parsing; type/table/schema проверяются; Telegram values HTML-escaped; error responses 405/401/400/500 типизированы; логи содержат только public_reference/request_type/error, без name/phone/comment. Deno tests mock fetch и проверяют 6 сценариев. `supabase/functions` исключён из Expo tsconfig и Vitest discovery, потому что проверяется отдельным Deno runtime.

`pnpm check`, `pnpm lint`, `pnpm test` PASS: 177 passed, 1 skipped. `deno test --allow-env supabase/functions/notify-lead/index.test.ts` PASS: 6 passed, 0 failed. Deploy в Supabase, Telegram bot, Dashboard Database Webhook и реальные secrets не выполнялись. Package2, tab bar, catalog, Home, Favorites, Lead и SQL/RLS не менялись. Evidence и отчёт: `docs/recovery-r1.5/`, `docs/BACKEND-R2.md`. После commit/tag — стоп до приёмки R1.5.
