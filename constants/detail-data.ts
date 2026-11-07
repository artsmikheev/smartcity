import { catalogDemoApartments } from './mock-data';
import type { CatalogApartment } from '../types/catalog';
// Additional related preview rows reproduce the remaining seed entries only.
const base = catalogDemoApartments[0];
export const detailDemoApartments: CatalogApartment[] = [
  ...catalogDemoApartments,
  { ...base, id: 'demo-k1-101', number: '101', floor: 1, rooms: 0, area: 25, price: 8900000, availability_status: 'available', layout_id: 'studio-25', plan_path: 'asset://plans/studio-25.svg' },
  { ...base, id: 'demo-k2-412', number: '412', floor: 4, rooms: 2, area: 62, price: 17600000, availability_status: 'available', layout_id: 'two-room-62', building_id: 'demo-k2', building_title: 'Корпус 2', plan_path: 'asset://plans/two-room-62.svg' },
  { ...base, id: 'demo-k2-508', number: '508', floor: 5, rooms: 3, area: 78, price: 21900000, availability_status: 'reserved', layout_id: 'three-room-78', building_id: 'demo-k2', building_title: 'Корпус 2', plan_path: 'asset://plans/three-room-78.svg' },
];
