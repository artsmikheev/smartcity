import type { CatalogApartment, CatalogMode, PriceSort } from '../types/catalog';
import type { AvailabilityStatus } from '../types/db';

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

export function apartmentTitle(apartment: Pick<CatalogApartment, 'rooms' | 'area'>): string {
  const rooms = apartment.rooms === 0 ? 'Студия' : `${apartment.rooms}-комнатная`;
  return `${rooms}\n${number.format(apartment.area)} м²`;
}

export function apartmentPrice(price: number | null): string {
  return price === null ? 'По запросу' : currency.format(price).replace(/[\u00a0\u202f]/g, ' ');
}

const shortStatus: Record<AvailabilityStatus, string> = {
  available: 'В ПРОДАЖЕ', reserved: 'РЕЗЕРВ', sold: 'ПРОДАНО', hidden: 'СКРЫТО', unknown: 'УТОЧНЯЕТСЯ',
};

export function apartmentMeta(apartment: Pick<CatalogApartment, 'floor' | 'availability_status'>): string {
  return `${apartment.floor} ЭТАЖ · ${shortStatus[apartment.availability_status]}`;
}

export function visibleApartments(
  apartments: CatalogApartment[], mode: CatalogMode, rooms: number | null, sort: PriceSort,
): CatalogApartment[] {
  return apartments
    .filter((apartment) => rooms === null || apartment.rooms === rooms)
    .filter((apartment) => mode !== 'blueprints' || ((apartment.media_kind === 'plan' || apartment.media_kind === 'schematic') && Boolean(apartment.plan_path)))
    .sort((a, b) => {
      if (a.price === null && b.price === null) return a.id.localeCompare(b.id);
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (sort === 'price_asc' ? a.price - b.price : b.price - a.price) || a.id.localeCompare(b.id);
    });
}

export function variantsLabel(count: number): string {
  const last = count % 10;
  const tens = count % 100;
  const word = tens >= 11 && tens <= 14 ? 'вариантов' : last === 1 ? 'вариант' : last >= 2 && last <= 4 ? 'варианта' : 'вариантов';
  return `${count} ${word}`;
}
