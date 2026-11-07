import { describe, expect, it } from 'vitest';
import { detailDemoApartments } from '../constants/detail-data';
import { catalogDemoApartments } from '../constants/mock-data';
import { planXml } from '../assets/images/plans/xml';
describe('detail demo seed integrity', () => {
  it('keeps the catalog composition at three cards', () => expect(catalogDemoApartments).toHaveLength(3));
  it('uses six seed entries to provide three honest similar choices', () => expect(detailDemoApartments).toHaveLength(6));
  it('does not invent availability, floor or price for the55sqm example', () => {
    expect(detailDemoApartments.find((row) => row.id === 'demo-k1-305')).toMatchObject({ floor: 3, area: 55, price: 15800000, availability_status: 'sold', is_demo: true });
  });
  it.each(detailDemoApartments.map((row) => [row.id, row.plan_path]))('has source SVG for %s', (_, path) => expect(planXml[String(path)]).toBeTruthy());
});
