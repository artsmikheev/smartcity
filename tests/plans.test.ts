import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { planXml } from '../assets/images/plans/xml';
import { resolveMediaUrl } from '../lib/storage';
const slugs = ['studio-25', 'one-room-38', 'two-room-55', 'two-room-62', 'three-room-78'];
describe('source-controlled schematic plans', () => {
  it('contains exactly five known placeholders', () => expect(Object.keys(planXml)).toHaveLength(5));
  it.each(slugs)('%s has matching XML and original SVG source', (slug) => {
    const xml = readFileSync(resolve('assets/images/plans', slug + '.svg'), 'utf8');
    expect(planXml['asset://plans/' + slug + '.svg']).toBe(xml);
    expect(xml).toContain('fill="#121212"');
    expect(xml).toContain('stroke-opacity="0.06"');
    expect(xml).toContain('stroke-width="2"');
    expect(xml).toContain('font-size="8"');
    expect(xml).toContain('ДЕМО · НЕ В МАСШТАБЕ');
    expect(xml).toContain('СХЕМА');
    expect(xml).toContain('stroke-dasharray=');
  });
  it.each(['asset://plans/unknown.svg', 'asset://plans/../two-room-55.svg', 'asset://plans/studio-25.png'])('rejects invalid or obsolete plan assets %s', (path) => expect(resolveMediaUrl(path)).toBeNull());
});
