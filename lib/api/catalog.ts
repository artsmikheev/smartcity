import type { CatalogApartment } from '../../types/catalog';

// Read-only configuration probe must not initialize AsyncStorage/Auth during
// Expo Web server rendering. The accepted R1.2 client stays unchanged.
export const supabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

export async function fetchCatalog(signal?: AbortSignal): Promise<CatalogApartment[]> {
  if (!supabaseConfigured) throw new Error('Сервис временно недоступен');

  const { supabase } = await import('../supabase');
  let query = supabase.from('apartments').select('*, layouts(plan_path), buildings(title)').eq('published', true);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(({ layouts, buildings, ...apartment }) => ({
    ...apartment,
    plan_path: layouts?.plan_path ?? null,
    media_kind: layouts?.plan_path?.startsWith('asset://plans/') ? 'schematic' : 'plan',
    building_title: buildings?.title,
  }));
}
