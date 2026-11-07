import { z } from 'zod';

import type { ConsentVersion, Database, LeadRequestType } from '../types/db';

export type LeadChannel = 'call' | 'telegram';
export type LeadConsent = Pick<ConsentVersion, 'version' | 'body' | 'legal_basis' | 'published_at' | 'superseded_at'>;
export type LeadContext = { type?: string; apartmentId?: string; layoutId?: string; demo?: boolean };
export type SubmitLeadArgs = Database['public']['Functions']['submit_lead']['Args'];

/** Reject foreign prefixes, extra digits and text instead of silently repairing them. */
export function normalizeRuPhone(value: string): string {
  if (!/^[+\d\s().-]*$/.test(value) || /\+.*\+/.test(value) || (value.includes('+') && !value.trim().startsWith('+'))) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 && !value.trim().startsWith('+')) return `+7${digits}`;
  if (digits.length === 11 && /^[78]/.test(digits) && (!value.trim().startsWith('+') || digits.startsWith('7'))) return `+7${digits.slice(1)}`;
  return '';
}

export function isValidRuPhone(value: string): boolean {
  const normalized = normalizeRuPhone(value);
  // Russia's geographic/mobile ranges; exclude Kazakhstan's +7 6/+7 7 ranges.
  return /^\+7[3489]\d{9}$/.test(normalized) && !/^(\d)\1{9}$/.test(normalized.slice(2));
}

/** Editable mask; oversized/foreign input remains visible and fails validation. */
export function formatRuPhone(value: string): string {
  if (!value) return '';
  if (!/^[+\d\s().-]*$/.test(value)) return value;
  if (/\+.*\+/.test(value) || (value.includes('+') && !value.trim().startsWith('+7'))) return value;
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  let national = digits;
  if (value.trim().startsWith('+')) {
    if (!value.trim().startsWith('+7') || digits.length > 11) return value;
    national = digits.slice(1);
  } else if ((digits.length === 11 || digits.length < 10) && /^[78]/.test(digits)) {
    national = digits.slice(1);
  } else if (digits.length > 10) return value;
  if (!national) return '';
  let masked = `+7 (${national.slice(0, 3)}`;
  // Close only with the next digit, so Backspace never re-inserts punctuation.
  if (national.length > 3) masked += ')';
  if (national.length > 3) masked += ` ${national.slice(3, 6)}`;
  if (national.length > 6) masked += `-${national.slice(6, 8)}`;
  if (national.length > 8) masked += `-${national.slice(8, 10)}`;
  return masked;
}

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя: не менее 2 символов.').max(100, 'Имя должно быть не длиннее 100 символов.'),
  phone: z.string().refine(isValidRuPhone, 'Введите российский номер: +7 и 10 цифр.').transform(normalizeRuPhone),
  channel: z.enum(['call', 'telegram'], { error: 'Выберите канал связи.' }),
  consent: z.boolean().refine((value) => value, 'Прочитайте и примите согласие на обработку данных.'),
});
export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormValues = z.output<typeof leadFormSchema>;

export function firstLeadParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function mapLeadRequestType(type?: string): LeadRequestType {
  switch (type) {
    case 'manager_call': return 'manager_call';
    case 'mortgage':
    case 'mortgage_consultation': return 'mortgage_consultation';
    case 'apartment':
    case 'apartment_booking': return 'apartment_booking';
    case 'layout':
    case 'layout_request': return 'layout_request';
    case 'price_request': return 'price_request';
    case 'partner_request': return 'partner_request';
    default: return 'other';
  }
}

export function leadHeading(type?: string): { kicker: string; title: string } {
  switch (mapLeadRequestType(type)) {
    case 'mortgage_consultation': return { kicker: 'ИПОТЕКА', title: 'Узнать условия' };
    case 'apartment_booking': return { kicker: 'КВАРТИРА', title: 'Оставить заявку' };
    case 'layout_request': return { kicker: 'ПЛАНИРОВКА', title: 'Оставить заявку' };
    case 'price_request': return { kicker: 'КОНСУЛЬТАЦИЯ', title: 'Узнать условия' };
    default: return { kicker: 'КОНСУЛЬТАЦИЯ', title: 'Оставить заявку' };
  }
}

export function isDemoConsent(consent: LeadConsent): boolean {
  return /(?:^|[-_])demo(?:$|[-_])/i.test(consent.version) || /демо|demo/iu.test(consent.body);
}

export function isPublishedConsent(consent: LeadConsent, now: Date = new Date()): boolean {
  const published = consent.published_at ? Date.parse(consent.published_at) : NaN;
  return Boolean(consent.version.trim() && consent.body.trim() && consent.legal_basis.trim()) && consent.superseded_at === null && Number.isFinite(published) && published <= now.getTime();
}

export function selectPublishedConsent(rows: LeadConsent[], now: Date = new Date()): LeadConsent | null {
  const active = rows.filter((row) => isPublishedConsent(row, now)).sort((a, b) => Date.parse(b.published_at!) - Date.parse(a.published_at!));
  return active.find((row) => !isDemoConsent(row)) ?? active[0] ?? null;
}

export type LeadErrorCode = 'not_configured' | 'validation' | 'invalid_property' | 'consent_unavailable' | 'demo_consent' | 'duplicate' | 'network' | 'unavailable' | 'invalid_response';
export class LeadServiceError extends Error {
  constructor(public readonly code: LeadErrorCode, message: string) {
    super(message);
    this.name = 'LeadServiceError';
  }
}

export function validateLeadPropertyId(value?: string): string | null {
  if (value === undefined) return null;
  const parsed = z.uuid().safeParse(value);
  if (!parsed.success) throw new LeadServiceError('invalid_property', 'Это демонстрационный или некорректный объект. Выберите квартиру из рабочего каталога.');
  return parsed.data;
}

export function createLeadArgs(input: LeadFormInput, context: LeadContext, consent: LeadConsent, consentedAt: string, now: Date = new Date()): SubmitLeadArgs {
  if (context.demo) throw new LeadServiceError('invalid_property', 'Это демонстрационный объект. Выберите квартиру из рабочего каталога.');
  const values = leadFormSchema.safeParse(input);
  if (!values.success) throw new LeadServiceError('validation', 'Проверьте поля формы и подтвердите согласие.');
  const apartmentId = validateLeadPropertyId(context.apartmentId);
  const layoutId = validateLeadPropertyId(context.layoutId);
  if (!isPublishedConsent(consent, now)) throw new LeadServiceError('consent_unavailable', 'Актуальное согласие недоступно. Откройте текст согласия ещё раз и повторите отправку.');
  if (isDemoConsent(consent)) throw new LeadServiceError('demo_consent', 'Опубликован только демо-текст: юридическая редакция не утверждена. Реальная отправка недоступна.');
  const accepted = Date.parse(consentedAt);
  if (!Number.isFinite(accepted) || accepted < Date.parse(consent.published_at!) || accepted > now.getTime()) throw new LeadServiceError('validation', 'Откройте текст согласия и подтвердите его заново.');
  return {
    p_name: values.data.name,
    p_phone: values.data.phone,
    p_contact_channel: values.data.channel,
    p_comment: null,
    p_request_type: mapLeadRequestType(context.type),
    p_source: 'mobile_app',
    p_apartment_id: apartmentId,
    p_layout_id: layoutId,
    p_consent_version: consent.version,
    p_consented_at: consentedAt,
    p_payload: {},
  };
}

/** Never expose server text/details (which may contain personal data) in the UI. */
export function toLeadServiceError(error: unknown): LeadServiceError {
  if (error instanceof LeadServiceError) return error;
  if (error && typeof error === 'object') {
    const candidate = error as { code?: unknown; details?: unknown; message?: unknown };
    if (candidate.code === 'P0001') {
      if (candidate.details === 'duplicate_recent') return new LeadServiceError('duplicate', 'Такой запрос уже отправлен недавно. Подождите 10 минут перед повторной отправкой.');
      switch (candidate.message) {
        case 'name_required': return new LeadServiceError('validation', 'Укажите имя: не менее 2 символов.');
        case 'phone_required':
        case 'phone_invalid': return new LeadServiceError('validation', 'Проверьте российский номер телефона.');
        case 'consent_required':
        case 'consent_version_invalid': return new LeadServiceError('consent_unavailable', 'Согласие обновилось. Откройте актуальную редакцию и подтвердите её заново.');
        case 'apartment_not_found':
        case 'layout_not_found': return new LeadServiceError('invalid_property', 'Объект недоступен. Вернитесь в каталог и выберите другой вариант.');
      }
    }
    if (candidate.code === '23503' || candidate.code === '22P02') return new LeadServiceError('invalid_property', 'Проверьте выбранный объект в каталоге.');
    if (candidate.code === '23505') return new LeadServiceError('unavailable', 'Не удалось отправить заявку. Повторите попытку позже.');
    if (candidate.code === '42501' || candidate.code === '42P01' || candidate.code === '42702' || candidate.code === 'PGRST202') return new LeadServiceError('unavailable', 'Сервис заявок временно недоступен. Попробуйте позже.');
  }
  if (error instanceof TypeError) return new LeadServiceError('network', 'Не удалось связаться с сервисом. Проверьте подключение и повторите попытку.');
  return new LeadServiceError('unavailable', 'Не удалось подтвердить отправку. Данные сохранены в форме; повторите попытку позже.');
}

export function isPublicLeadReference(value: unknown): value is string {
  return typeof value === 'string' && /^SC-\d{6}-[a-f0-9]{6}$/i.test(value);
}
