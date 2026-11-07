import { assert, assertEquals, assertStringIncludes, assertNotMatch } from 'jsr:@std/assert@1';
import { handleNotifyLead } from './index.ts';

const secret = 'test-webhook-secret';
const record = {
  id: 'lead-id-123',
  public_reference: 'SC-07112026-ABC123',
  name: 'Анна <Тест>',
  phone: '+7 (999) 123-45-67',
  request_type: 'manager_call',
  contact_channel: 'telegram',
  comment: 'Позвоните после 18:00',
  apartment_id: '12345678-aaaa-bbbb-cccc-1234567890ab',
  layout_id: null,
  created_at: '2026-11-07T10:00:00.000Z',
};

function request(body: unknown, providedSecret = secret): Request {
  return new Request('https://functions.test/notify-lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-webhook-secret': providedSecret },
    body: JSON.stringify(body),
  });
}

function payload(overrides: Record<string, unknown> = {}) {
  return { type: 'INSERT', table: 'leads', schema: 'public', record, old_record: null, ...overrides };
}

Deno.test('valid INSERT sends one Telegram request and returns 200', async () => {
  Deno.env.set('NOTIFY_WEBHOOK_SECRET', secret);
  Deno.env.set('TELEGRAM_BOT_TOKEN', '123456:test-token');
  Deno.env.set('TELEGRAM_CHAT_ID', '-100123');
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    const response = await handleNotifyLead(request(payload()));
    assertEquals(response.status, 200);
    assertEquals(await response.json(), { ok: true });
    assertEquals(calls.length, 1);
    assertEquals(calls[0].url, 'https://api.telegram.org/bot123456:test-token/sendMessage');
    const body = JSON.parse(String(calls[0].init.body));
    assertEquals(body.chat_id, '-100123');
    assertEquals(body.parse_mode, 'HTML');
    assertStringIncludes(body.text, 'SC-07112026-ABC123');
    assertStringIncludes(body.text, 'Анна &lt;Тест&gt;');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('invalid secret returns 401 and does not call Telegram', async () => {
  Deno.env.set('NOTIFY_WEBHOOK_SECRET', secret);
  let calls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { calls += 1; return new Response('{}'); };
  try {
    const response = await handleNotifyLead(request(payload(), 'wrong-secret'));
    assertEquals(response.status, 401);
    assertEquals(await response.json(), { error: 'unauthorized' });
    assertEquals(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test('UPDATE payload returns invalid_payload', async () => {
  Deno.env.set('NOTIFY_WEBHOOK_SECRET', secret);
  const response = await handleNotifyLead(request(payload({ type: 'UPDATE' })));
  assertEquals(response.status, 400);
  assertEquals(await response.json(), { error: 'invalid_payload' });
});

Deno.test('Telegram failure returns 500 and logs only safe identifiers', async () => {
  Deno.env.set('NOTIFY_WEBHOOK_SECRET', secret);
  Deno.env.set('TELEGRAM_BOT_TOKEN', 'token');
  Deno.env.set('TELEGRAM_CHAT_ID', 'chat');
  const logs: string[] = [];
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: false }), { status: 500 });
  console.error = (...args: unknown[]) => logs.push(args.map(String).join(' '));
  try {
    const response = await handleNotifyLead(request(payload()));
    assertEquals(response.status, 500);
    assertEquals(await response.json(), { error: 'telegram_failed' });
    assertEquals(logs.length, 1);
    assertStringIncludes(logs[0], 'SC-07112026-ABC123');
    assertStringIncludes(logs[0], 'manager_call');
    assertNotMatch(logs.join('\n'), /Анна|999|Позвоните/);
  } finally { globalThis.fetch = originalFetch; console.error = originalError; }
});

Deno.test('PII never reaches console logs', async () => {
  Deno.env.set('NOTIFY_WEBHOOK_SECRET', secret);
  Deno.env.delete('TELEGRAM_BOT_TOKEN');
  Deno.env.delete('TELEGRAM_CHAT_ID');
  const logs: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => logs.push(args.map(String).join(' '));
  try {
    await handleNotifyLead(request(payload()));
    assert(logs.length > 0);
    assertNotMatch(logs.join('\n'), /Анна|999|Позвоните/);
    assertStringIncludes(logs[0], 'SC-07112026-ABC123');
  } finally { console.error = originalError; }
});

Deno.test('non-POST returns 405 without reading secret or body', async () => {
  const response = await handleNotifyLead(new Request('https://functions.test/notify-lead', { method: 'GET' }));
  assertEquals(response.status, 405);
  assertEquals(await response.json(), { error: 'method_not_allowed' });
});
