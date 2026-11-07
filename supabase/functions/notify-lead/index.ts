import { corsHeaders } from '../_shared/cors.ts';
import type { LeadInsertWebhook, LeadWebhookRecord } from '../_shared/types.ts';

const requestTypeLabels: Record<string, string> = {
  manager_call: 'Связь с менеджером',
  mortgage_consultation: 'Ипотечная консультация',
  apartment_booking: 'Бронь квартиры',
  layout_request: 'Запрос планировки',
  price_request: 'Узнать цену',
  partner_request: 'Партнёрство',
  other: 'Другое',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function shortId(value: string | null): string {
  return value ? `ID ${value.slice(0, 8)}` : '—';
}

export function formatMoscowDate(value: string): string {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')}.${get('month')}.${get('year')} ${get('hour')}:${get('minute')}`;
}

export function buildTelegramMessage(record: LeadWebhookRecord): string {
  const requestType = requestTypeLabels[record.request_type] ?? record.request_type;
  return [
    '🔔 <b>Новая заявка</b>',
    `<code>${escapeHtml(record.public_reference)}</code>`,
    '',
    `<b>Тип:</b> ${escapeHtml(requestType)}`,
    `<b>Имя:</b> ${escapeHtml(record.name)}`,
    `<b>Телефон:</b> <code>${escapeHtml(record.phone)}</code>`,
    `<b>Канал:</b> ${escapeHtml(record.contact_channel)}`,
    `<b>Комментарий:</b> ${escapeHtml(record.comment || '—')}`,
    `<b>Квартира:</b> ${escapeHtml(shortId(record.apartment_id))}`,
    `<b>Планировка:</b> ${escapeHtml(shortId(record.layout_id))}`,
    `<b>Время:</b> ${formatMoscowDate(record.created_at)}`,
  ].join('\n');
}

function isLeadInsertWebhook(value: unknown): value is LeadInsertWebhook {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<LeadInsertWebhook>;
  return payload.type === 'INSERT'
    && payload.table === 'leads'
    && payload.schema === 'public'
    && Boolean(payload.record)
    && typeof payload.record?.public_reference === 'string'
    && typeof payload.record?.request_type === 'string'
    && typeof payload.record?.name === 'string'
    && typeof payload.record?.phone === 'string'
    && typeof payload.record?.created_at === 'string';
}

export async function handleNotifyLead(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const expectedSecret = Deno.env.get('NOTIFY_WEBHOOK_SECRET');
  if (!expectedSecret || request.headers.get('x-webhook-secret') !== expectedSecret) {
    return json({ error: 'unauthorized' }, 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_payload' }, 400);
  }
  if (!isLeadInsertWebhook(payload)) return json({ error: 'invalid_payload' }, 400);

  const record = payload.record;
  const publicReference = record.public_reference;
  const requestType = record.request_type;
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!token || !chatId) {
    console.error(JSON.stringify({ scope: 'notify-lead', public_reference: publicReference, request_type: requestType, error: 'telegram_config_missing' }));
    return json({ error: 'telegram_failed' }, 500);
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramMessage(record),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const telegramBody = await telegramResponse.json().catch(() => null) as { ok?: boolean } | null;
    if (!telegramResponse.ok || telegramBody?.ok !== true) throw new Error('telegram response was not ok');
    return json({ ok: true });
  } catch {
    console.error(JSON.stringify({ scope: 'notify-lead', public_reference: publicReference, request_type: requestType, error: 'telegram_failed' }));
    return json({ error: 'telegram_failed' }, 500);
  }
}

if (import.meta.main) Deno.serve(handleNotifyLead);
