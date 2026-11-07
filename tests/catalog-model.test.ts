import { describe, expect, it } from 'vitest';
import { apartmentTitle, apartmentMeta, apartmentPrice, variantsLabel, visibleApartments } from '../lib/catalog-model';
import { catalogDemoApartments } from '../constants/mock-data';

describe('catalog display model', () => {
  it('uses a semantic two-line title', () => expect(apartmentTitle({ rooms: 1, area: 38 })).toBe('1-комнатная\n38 м²'));
  it('formats studio and decimal area without phantom rooms', () => expect(apartmentTitle({ rooms: 0, area: 25.5 })).toBe('Студия\n25,5 м²'));
  it('formats RUB price without fractions or narrow spaces', () => expect(apartmentPrice(12900000)).toBe('12 900 000 ₽'));
  it('keeps missing price honest', () => expect(apartmentPrice(null)).toBe('По запросу'));
  it('uses concise factual metadata, not badge or apartment number', () => expect(apartmentMeta({ floor: 4, availability_status: 'available' })).toBe('4 ЭТАЖ · В ПРОДАЖЕ'));
  it.each([[0, '0 вариантов'], [1, '1 вариант'], [3, '3 варианта'], [12, '12 вариантов'], [21, '21 вариант']])('pluralizes %s', (count, expected) => expect(variantsLabel(Number(count))).toBe(expected));
  it('sorts without mutating the original source', () => {
    const initial = catalogDemoApartments.map((apartment) => apartment.id);
    const sorted = visibleApartments(catalogDemoApartments, 'apartments', null, 'price_desc');
    expect(sorted[0].price).toBe(15800000);
    expect(catalogDemoApartments.map((apartment) => apartment.id)).toEqual(initial);
  });
  it('filters rooms and can return empty', () => expect(visibleApartments(catalogDemoApartments, 'apartments', 3, 'price_asc')).toEqual([]));
  it('never labels concept renderings as blueprints', () => expect(visibleApartments(catalogDemoApartments.map((row) => ({ ...row, media_kind: 'concept' as const })), 'blueprints', null, 'price_asc')).toEqual([]));
  it('admits explicitly labeled schematic placeholders', () => expect(visibleApartments(catalogDemoApartments, 'blueprints', null, 'price_asc')).toHaveLength(3));
  it('admits only plans with a media path in blueprint mode', () => {
    const plan = { ...catalogDemoApartments[0], media_kind: 'plan' as const, plan_path: 'https://example.com/plan.jpg' };
    expect(visibleApartments([plan, { ...plan, plan_path: null }], 'blueprints', null, 'price_asc')).toEqual([plan]);
  });
});
