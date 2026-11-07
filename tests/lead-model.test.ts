import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createLeadArgs, firstLeadParam, formatRuPhone, isDemoConsent, isPublishedConsent,
  isPublicLeadReference, isValidRuPhone, leadFormSchema, leadHeading,
  LeadServiceError, mapLeadRequestType, normalizeRuPhone, selectPublishedConsent,
  toLeadServiceError, validateLeadPropertyId, type LeadConsent,
} from '../lib/lead-model';
import { clearAcceptedLeadReference, fetchPublishedLeadConsent, getAcceptedLeadReference, submitLead } from '../lib/api/leads';

// Synthetic test values only. All Supabase operations below are local mocks.
const mocks = vi.hoisted(() => ({ configured: true, rpc: vi.fn(), from: vi.fn() }));
vi.mock('../lib/api/catalog', () => ({ get supabaseConfigured() { return mocks.configured; } }));
vi.mock('../lib/supabase', () => ({ supabase: { rpc: mocks.rpc, from: mocks.from } }));

const now = new Date('2026-11-07T12:00:00Z');
const consent: LeadConsent = {
  version: 'test-approved-version', body: 'Synthetic legal test fixture, not public legal copy.',
  legal_basis: 'Test fixture', published_at: '2026-11-01T00:00:00Z', superseded_at: null,
};
const values = { name: 'Тест', phone: '+7 (999) 000-00-00', channel: 'call' as const, consent: true };
const acceptedAt = '2026-11-07T11:59:00Z';
const objectId = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  mocks.configured = true;
  mocks.rpc.mockReset();
  mocks.from.mockReset();
  clearAcceptedLeadReference();
});

describe('RU phone normalization and editable mask', () => {
  it.each(['79990000000', '89990000000', '9990000000', '+7 (999) 000-00-00'])('normalizes permitted paste format %#', (phone) => {
    expect(normalizeRuPhone(phone)).toBe('+79990000000');
    expect(formatRuPhone(phone)).toBe('+7 (999) 000-00-00');
    expect(isValidRuPhone(phone)).toBe(true);
  });
  it.each(['+799900000000', '+19990000000', '+89990000000', '999000000', 'phone', '+7 9990000000 ext1', '+7+9990000000', '99+90000000'])('rejects malformed input %#', (phone) => expect(isValidRuPhone(phone)).toBe(false));
  it('rejects Kazakhstan ranges and implausible repeated national digits', () => {
    expect(isValidRuPhone('+76990000000')).toBe(false);
    expect(isValidRuPhone('+77990000000')).toBe(false);
    expect(isValidRuPhone('+79999999999')).toBe(false);
  });
  it('supports geographic Russian numbers and local ten digits starting with 8', () => expect(isValidRuPhone('8000000000')).toBe(true));
  it('keeps partial typing/deleting editable', () => {
    expect(formatRuPhone('')).toBe('');
    expect(formatRuPhone('+7')).toBe('');
    expect(formatRuPhone('9')).toBe('+7 (9');
    expect(formatRuPhone('+7 (999) 000-00-0')).toBe('+7 (999) 000-00-0');
  });
  it('defers closing punctuation until the next national digit', () => {
    expect(formatRuPhone('+7 (999')).toBe('+7 (999');
    expect(formatRuPhone('+7 (9990')).toBe('+7 (999) 0');
  });
  it('backspaces through the closing boundary without restoring the parenthesis', () => {
    let phone = formatRuPhone('+79990');
    phone = formatRuPhone(phone.slice(0, -1));
    expect(phone).toBe('+7 (999');
    phone = formatRuPhone(phone.slice(0, -1));
    expect(phone).toBe('+7 (99');
    expect(formatRuPhone('+7 (999')).toBe('+7 (999');
  });
  it('can backspace a fully pasted number to empty without a mask trap', () => {
    let phone = formatRuPhone('+79990000000');
    for (let steps = 0; phone && steps < 20; steps += 1) {
      const shorter = formatRuPhone(phone.slice(0, -1));
      expect(shorter.length).toBeLessThan(phone.length);
      phone = shorter;
    }
    expect(phone).toBe('');
  });
  it('does not silently truncate oversized input', () => expect(formatRuPhone('+799900000000')).toBe('+799900000000'));
  it('does not repair misplaced/repeated plus signs into valid input', () => {
    expect(formatRuPhone('+7+9990000000')).toBe('+7+9990000000');
    expect(formatRuPhone('7+9990000000')).toBe('7+9990000000');
  });
});

describe('RHF/Zod lead contract', () => {
  it('trims name and returns the canonical phone', () => expect(leadFormSchema.parse({ ...values, name: '  Тест  ' })).toEqual({ ...values, name: 'Тест', phone: '+79990000000' }));
  it.each(['', 'Т', ' '.repeat(10), 'Т'.repeat(101)])('rejects invalid name %#', (name) => expect(leadFormSchema.safeParse({ ...values, name }).success).toBe(false));
  it('permits exactly 100 name characters', () => expect(leadFormSchema.safeParse({ ...values, name: 'Т'.repeat(100) }).success).toBe(true));
  it('requires true consent and exactly call/telegram', () => {
    expect(leadFormSchema.safeParse({ ...values, consent: false }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...values, channel: 'MAX' }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...values, channel: 'telegram' }).success).toBe(true);
  });
  it.each([
    ['manager_call', 'manager_call'], ['mortgage', 'mortgage_consultation'],
    ['apartment', 'apartment_booking'], ['price_request', 'price_request'],
    ['layout', 'layout_request'], ['partner_request', 'partner_request'],
    ['consultation', 'other'], ['unknown', 'other'],
  ])('maps known/fallback request type %#', (input, output) => expect(mapLeadRequestType(input)).toBe(output));
  it('retains direct database enum routes', () => expect(mapLeadRequestType('mortgage_consultation')).toBe('mortgage_consultation'));
  it('chooses exact mortgage/price headings', () => {
    expect(leadHeading('mortgage')).toEqual({ kicker: 'ИПОТЕКА', title: 'Узнать условия' });
    expect(leadHeading('price_request').title).toBe('Узнать условия');
  });
  it('reads the first scalar/array route parameter safely', () => {
    expect(firstLeadParam(['apartment', 'other'])).toBe('apartment');
    expect(firstLeadParam(undefined)).toBeUndefined();
  });
  it('allows missing IDs and UUIDs, refuses demo prefixes/empty/malformed IDs', () => {
    expect(validateLeadPropertyId()).toBeNull();
    expect(validateLeadPropertyId(objectId)).toBe(objectId);
    for (const id of ['demo-apartment-1', '', 'not-a-uuid']) expect(() => validateLeadPropertyId(id)).toThrow(LeadServiceError);
  });
  it('builds all eleven typed RPC arguments without PII in payload', () => {
    const args = createLeadArgs(values, { type: 'apartment', apartmentId: objectId }, consent, acceptedAt, now);
    expect(Object.keys(args)).toHaveLength(11);
    expect(args.p_phone).toBe('+79990000000');
    expect(args.p_request_type).toBe('apartment_booking');
    expect(args.p_apartment_id).toBe(objectId);
    expect(args.p_layout_id).toBeNull();
    expect(args.p_comment).toBeNull();
    expect(args.p_payload).toEqual({});
    expect(args.p_consent_version).toBe(consent.version);
    expect(args.p_consented_at).toBe(acceptedAt);
  });
  it.each([{ apartmentId: objectId }, { layoutId: objectId }, {}])('independently rejects flagged demo context even with valid UUIDs and approved consent %#', (context) => {
    try {
      createLeadArgs(values, { ...context, demo: true }, consent, acceptedAt, now);
      expect.fail('Demo context must not produce RPC arguments');
    } catch (error) {
      expect(error).toBeInstanceOf(LeadServiceError);
      expect(error).toMatchObject({ code: 'invalid_property' });
    }
  });
  it('permits explicitly non-demo UUID context', () => expect(createLeadArgs(values, { apartmentId: objectId, demo: false }, consent, acceptedAt, now).p_apartment_id).toBe(objectId));
});

describe('consent integrity and public reference', () => {
  it('accepts only published, active consent at/before now', () => {
    expect(isPublishedConsent(consent, now)).toBe(true);
    expect(isPublishedConsent({ ...consent, published_at: null }, now)).toBe(false);
    expect(isPublishedConsent({ ...consent, published_at: '2027-01-01' }, now)).toBe(false);
    expect(isPublishedConsent({ ...consent, superseded_at: acceptedAt }, now)).toBe(false);
    expect(isPublishedConsent({ ...consent, body: '' }, now)).toBe(false);
  });
  it('labels the actual seed legal document as demo/unapproved', () => {
    expect(isDemoConsent({ ...consent, version: '2026-11-05-demo' })).toBe(true);
    expect(isDemoConsent({ ...consent, body: 'Демо-текст согласия' })).toBe(true);
    expect(() => createLeadArgs(values, {}, { ...consent, version: '2026-11-05-demo' }, acceptedAt, now)).toThrow(/демо-текст/);
  });
  it('prefers active non-demo legal content, and never invents a version', () => {
    const demo = { ...consent, version: '2026-11-05-demo', published_at: '2026-11-06T00:00:00Z' };
    expect(selectPublishedConsent([demo, consent], now)?.version).toBe(consent.version);
    expect(selectPublishedConsent([], now)).toBeNull();
    expect(selectPublishedConsent([demo], now)?.version).toBe(demo.version);
  });
  it('rejects consent timestamps before publication, in the future or invalid', () => {
    for (const timestamp of ['2026-10-01', '2027-01-01', 'invalid']) expect(() => createLeadArgs(values, {}, consent, timestamp, now)).toThrow(LeadServiceError);
  });
  it('accepts only the existing backend public reference format', () => {
    expect(isPublicLeadReference('SC-261107-abcdef')).toBe(true);
    expect(isPublicLeadReference('UG-000000')).toBe(false);
    expect(isPublicLeadReference('DEMO-REFERENCE')).toBe(false);
    expect(isPublicLeadReference('SC-261107-abcdef?phone=test')).toBe(false);
  });
});

describe('safe typed error mapping', () => {
  it('maps duplicate only by structured SQL code/details', () => expect(toLeadServiceError({ code: 'P0001', details: 'duplicate_recent', message: 'lead_validation_failed' }).code).toBe('duplicate'));
  it('does not substring-match untrusted server messages', () => expect(toLeadServiceError({ code: 'P0001', message: 'unexpected duplicate_recent phone_required' }).code).toBe('unavailable'));
  it('handles explicit server validation messages and known SQL failure codes', () => {
    expect(toLeadServiceError({ code: 'P0001', message: 'consent_version_invalid' }).code).toBe('consent_unavailable');
    expect(toLeadServiceError({ code: '42P01', message: 'private SQL data' }).code).toBe('unavailable');
    expect(toLeadServiceError({ code: '22P02' }).code).toBe('invalid_property');
  });
  it('never leaks raw error contents', () => expect(toLeadServiceError({ message: 'PRIVATE_SENTINEL', details: 'PRIVATE_SENTINEL' }).message).not.toContain('PRIVATE_SENTINEL'));
});

describe('mock-only Supabase API integration', () => {
  it('stores only a verified backend reference after RPC, returning it unchanged', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ public_reference: 'SC-261107-abcdef' }], error: null });
    expect(getAcceptedLeadReference()).toBeNull();
    await expect(submitLead(values, {}, consent, acceptedAt)).resolves.toEqual({ public_reference: 'SC-261107-abcdef' });
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc.mock.calls[0][0]).toBe('submit_lead');
    expect(Object.keys(mocks.rpc.mock.calls[0][1])).toHaveLength(11);
    expect(getAcceptedLeadReference()).toBe('SC-261107-abcdef');
    clearAcceptedLeadReference();
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it('rejects malformed/empty server responses without a success proof', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    await expect(submitLead(values, {}, consent, acceptedAt)).rejects.toMatchObject({ code: 'invalid_response' });
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it('shows duplicate as an error, never a successful submission', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: 'P0001', details: 'duplicate_recent', message: 'lead_validation_failed' } });
    await expect(submitLead(values, {}, consent, acceptedAt)).rejects.toMatchObject({ code: 'duplicate' });
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it('makes no RPC or query when configuration is absent', async () => {
    mocks.configured = false;
    await expect(submitLead(values, {}, consent, acceptedAt)).rejects.toMatchObject({ code: 'not_configured' });
    await expect(fetchPublishedLeadConsent()).rejects.toMatchObject({ code: 'not_configured' });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it('refuses demo objects/legal consent before calling RPC', async () => {
    await expect(submitLead(values, { apartmentId: 'demo-apartment-1' }, consent, acceptedAt)).rejects.toMatchObject({ code: 'invalid_property' });
    await expect(submitLead(values, {}, { ...consent, version: '2026-11-05-demo' }, acceptedAt)).rejects.toMatchObject({ code: 'demo_consent' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('rejects a flagged demo UUID before any property lookup or RPC', async () => {
    await expect(submitLead(values, { apartmentId: objectId, demo: true }, consent, acceptedAt)).rejects.toMatchObject({ code: 'invalid_property' });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it.each([
    ['apartments', { apartmentId: objectId }],
    ['layouts', { layoutId: objectId }],
  ] as const)('refuses a stored demo %s UUID even when the route flag is omitted', async (table, context) => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: { is_demo: true }, error: null });
    mocks.from.mockReturnValue(query);
    await expect(submitLead(values, context, consent, acceptedAt)).rejects.toMatchObject({ code: 'invalid_property' });
    expect(mocks.from).toHaveBeenCalledWith(table);
    expect(query.select).toHaveBeenCalledWith('is_demo');
    expect(query.eq).toHaveBeenCalledWith('id', objectId);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it('verifies both selected real properties read-only before a single RPC', async () => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: { is_demo: false }, error: null });
    mocks.from.mockReturnValue(query);
    mocks.rpc.mockResolvedValue({ data: [{ public_reference: 'SC-261107-abcdef' }], error: null });
    await expect(submitLead(values, { apartmentId: objectId, layoutId: objectId, demo: false }, consent, acceptedAt)).resolves.toEqual({ public_reference: 'SC-261107-abcdef' });
    expect(mocks.from.mock.calls).toEqual([['apartments'], ['layouts']]);
    expect(query.maybeSingle).toHaveBeenCalledTimes(2);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(query.maybeSingle.mock.invocationCallOrder[1]).toBeLessThan(mocks.rpc.mock.invocationCallOrder[0]);
  });
  it('refuses an invisible/missing property without mutating the backend', async () => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.from.mockReturnValue(query);
    await expect(submitLead(values, { apartmentId: objectId }, consent, acceptedAt)).rejects.toMatchObject({ code: 'invalid_property' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('keeps structured RLS lookup failures safe and makes no RPC', async () => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: { code: '42501', message: 'PRIVATE_SENTINEL' } });
    mocks.from.mockReturnValue(query);
    await expect(submitLead(values, { layoutId: objectId }, consent, acceptedAt)).rejects.toMatchObject({ code: 'unavailable' });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(getAcceptedLeadReference()).toBeNull();
  });
  it('fetches legal content through a readonly active/published-at query', async () => {
    const query = { select: vi.fn(), is: vi.fn(), not: vi.fn(), lte: vi.fn(), order: vi.fn() };
    query.select.mockReturnValue(query);
    query.is.mockReturnValue(query);
    query.not.mockReturnValue(query);
    query.lte.mockReturnValue(query);
    query.order.mockResolvedValue({ data: [consent], error: null });
    mocks.from.mockReturnValue(query);
    await expect(fetchPublishedLeadConsent()).resolves.toEqual(consent);
    expect(mocks.from).toHaveBeenCalledWith('consent_versions');
    expect(query.is).toHaveBeenCalledWith('superseded_at', null);
    expect(query.lte).toHaveBeenCalledWith('published_at', expect.any(String));
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
