import type { Apartment } from './db';

export type CatalogApartment = Apartment & {
  plan_path: string | null;
  media_kind: 'plan' | 'concept';
};

export type CatalogMode = 'apartments' | 'blueprints';
export type PriceSort = 'price_asc' | 'price_desc';
export type CatalogPreview = 'content' | 'loading' | 'empty' | 'error';
