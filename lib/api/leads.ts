import { supabaseConfigured } from './catalog';
import {
  createLeadArgs,
  isPublicLeadReference,
  LeadServiceError,
  selectPublishedConsent,
  toLeadServiceError,
  type LeadConsent,
  type LeadContext,
  type LeadFormInput,
} from '../lead-model';

// Only a verified backend reference is retained. No form values, URLs or storage.
let acceptedReference: string | null = null;
export function getAcceptedLeadReference(): string | null { return acceptedReference; }
export function clearAcceptedLeadReference(): void { acceptedReference = null; }

function requireConfiguration(): void {
  if (!supabaseConfigured || (process.env.EXPO_OS === 'web' && typeof window === 'undefined')) {
    throw new LeadServiceError('not_configured', 'Сервис заявок не подключён. Отправка недоступна; данные остались в форме.');
  }
}

/** Read-only; future, unpublished and superseded versions are never offered. */
export async function fetchPublishedLeadConsent(signal?: AbortSignal): Promise<LeadConsent> {
  requireConfiguration();
  try {
    const { supabase } = await import('../supabase');
    const now = new Date();
    let query = supabase.from('consent_versions')
      .select('version, body, legal_basis, published_at, superseded_at')
      .is('superseded_at', null)
      .not('published_at', 'is', null)
      .lte('published_at', now.toISOString())
      .order('published_at', { ascending: false });
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw error;
    const consent = selectPublishedConsent(data ?? [], now);
    if (!consent) throw new LeadServiceError('consent_unavailable', 'Утверждённый текст согласия пока не опубликован. Попробуйте позже.');
    return consent;
  } catch (error) {
    throw toLeadServiceError(error);
  }
}

/** Invoke only from a user-initiated, validated submit. Never from mount/preview. */
export async function submitLead(input: LeadFormInput, context: LeadContext, consent: LeadConsent, consentedAt: string): Promise<{ public_reference: string }> {
  clearAcceptedLeadReference();
  requireConfiguration();
  try {
    const args = createLeadArgs(input, context, consent, consentedAt);
    const { supabase } = await import('../supabase');
    // Demo flags are not trusted to survive deep links; verify selected records.
    const properties = [['apartments', args.p_apartment_id], ['layouts', args.p_layout_id]] as const;
    for (const [table, id] of properties) {
      if (!id) continue;
      const { data: property, error: lookupError } = await supabase.from(table).select('is_demo').eq('id', id).maybeSingle();
      if (lookupError) throw lookupError;
      if (!property || property.is_demo) throw new LeadServiceError('invalid_property', 'Это демонстрационный или недоступный объект. Выберите квартиру из рабочего каталога.');
    }
    const { data, error } = await supabase.rpc('submit_lead', args);
    if (error) throw error;
    if (!data || data.length !== 1 || !isPublicLeadReference(data[0]?.public_reference)) {
      throw new LeadServiceError('invalid_response', 'Сервис не подтвердил приём заявки. Номер не получен; попробуйте позже.');
    }
    acceptedReference = data[0].public_reference;
    return { public_reference: acceptedReference };
  } catch (error) {
    throw toLeadServiceError(error);
  }
}
