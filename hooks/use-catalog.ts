import { useQuery } from '@tanstack/react-query';
import { fetchCatalog, supabaseConfigured } from '@/lib/api/catalog';
import { catalogDemoApartments } from '@/constants/mock-data';
import type { CatalogPreview } from '@/types/catalog';

export function catalogPreview(value: string | string[] | undefined): CatalogPreview | undefined {
  if (!__DEV__) return undefined;
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === 'content' || candidate === 'loading' || candidate === 'empty' || candidate === 'error' ? candidate : undefined;
}

export function useCatalog(preview?: CatalogPreview) {
  const query = useQuery({
    queryKey: ['catalog', 'apartments'],
    queryFn: ({ signal }) => fetchCatalog(signal),
    enabled: supabaseConfigured && !preview,
    staleTime: 60000,
    retry: 1,
  });

  if (preview) return {
    data: preview === 'content' ? catalogDemoApartments : [],
    loading: preview === 'loading',
    error: preview === 'error',
    unavailable: preview === 'error',
    preview: true,
    retry: () => undefined,
  };

  return {
    data: query.data ?? [],
    loading: supabaseConfigured && query.isPending,
    error: !supabaseConfigured || query.isError,
    unavailable: !supabaseConfigured,
    preview: false,
    retry: () => { if (supabaseConfigured) void query.refetch(); },
  };
}
