import { chromium } from '/tmp/smartcity-r12-tools/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const out = '/home/ubuntu/recovery-r1-3';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
async function capture(state, query = `?preview=${state}`) {
  await page.goto(`http://127.0.0.1:8081/layouts${query}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByTestId('floating-tab-bar').waitFor({ state: 'visible', timeout: 60000 });
  if (state === 'content') {
    await page.getByTestId('apartment-card-demo-k1-204').waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('img')].every((image) => image.complete));
  } else await page.getByTestId(`catalog-${state}`).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/catalog-${state}-375x812.png` });
}
await capture('error', '');
if (!await page.getByText('Сервис временно недоступен', { exact: true }).isVisible()) throw new Error('Unconfigured default must be unavailable error.');
await capture('loading');
if (await page.locator('[data-testid^="catalog-skeleton-"]').count() !== 3) throw new Error('Expected exactly three skeletons.');
await capture('empty');
await page.getByRole('button', { name: 'Сбросить фильтры', exact: true }).click();
await page.getByTestId('apartment-card-demo-k1-204').waitFor();
await capture('content');
const eyebrowBox = await page.getByText('НАУКОГРАД / РЕУТОВ', { exact: true }).boundingBox();
const headingBox = await page.getByText('Планировки', { exact: true }).first().boundingBox();
const subtitleBox = await page.getByText('Тишина, свет, честные метры.', { exact: true }).boundingBox();
const headerGaps = {
  eyebrowToTitle: headingBox.y - eyebrowBox.y - eyebrowBox.height,
  titleToSubtitle: subtitleBox.y - headingBox.y - headingBox.height,
};
if (headerGaps.eyebrowToTitle !== 8 || headerGaps.titleToSubtitle !== 24) throw new Error('Header gaps must be 8/24 in actual DOM.');
const measurements = await page.evaluate(() => {
  function box(id) {
    const element = document.querySelector(`[data-testid="${id}"]`);
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      fontSize: style.fontSize, lineHeight: style.lineHeight, family: style.fontFamily, weight: style.fontWeight,
      color: style.color, background: style.backgroundColor, radius: style.borderRadius,
      padding: style.padding, overflow: style.overflow, shadow: style.boxShadow, text: element.innerText,
    };
  }
  const id = 'demo-k1-204';
  return {
    card: box(`apartment-card-${id}`), clip: box(`card-clip-${id}`), textZone: box(`card-text-${id}`),
    title: box(`card-title-${id}`), meta: box(`card-meta-${id}`), price: box(`card-price-${id}`),
    mediaZone: box(`card-media-zone-${id}`), media: box(`card-media-${id}`), heart: box(`card-heart-${id}`), heartCircle: box(`card-heart-circle-${id}`),
    pill: box('floating-tab-bar'), filter: box('catalog-filter'),
    images: [...document.querySelectorAll('img')].map((image) => ({ src: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight, loaded: image.complete && image.naturalWidth > 0 })),
  };
});
if (measurements.card.height !== 160 || measurements.clip.padding !== '16px' || measurements.clip.radius !== '20px') throw new Error('Card dimensions do not match.');
if (measurements.card.shadow !== 'rgba(0, 0, 0, 0.35) 0px 8px 16px 0px') throw new Error('Expected exactly one specified Web shadow.');
if (measurements.heart.width !== 48 || measurements.heart.height !== 48 || measurements.heartCircle.width !== 44) throw new Error('Heart dimensions do not match.');
if (Math.abs(measurements.media.width - measurements.media.height) > 0.5 || measurements.media.height > 128.5) throw new Error('Image must remain square and fit height.');
if (!measurements.images.length || measurements.images.some((image) => !image.loaded)) throw new Error('Images must actually render.');
if (measurements.price.fontSize !== '22px' || measurements.title.fontSize !== '20px' || measurements.meta.fontSize !== '11px') throw new Error('Typography sizes do not match.');
const heart = page.getByTestId('card-heart-demo-k1-204');
await heart.click();
if (await heart.getAttribute('aria-pressed') !== 'true') throw new Error('Favorite state did not toggle.');
if (!page.url().includes('/layouts')) throw new Error('Heart must not trigger card navigation.');
await page.screenshot({ path: `${out}/catalog-favorited-375x812.png` });
await heart.click();
await page.getByRole('button', { name: 'Сначала дешевле. Изменить сортировку', exact: true }).click();
await page.waitForFunction(() => document.querySelector('[data-testid^="apartment-card-"]').dataset.testid === 'apartment-card-demo-k1-305');
await page.getByRole('button', { name: 'Фильтры', exact: true }).click();
await page.getByRole('button', { name: '3 комнаты', exact: true }).click();
await page.getByRole('button', { name: 'Показать варианты', exact: true }).click();
await page.getByTestId('catalog-empty').waitFor();
await page.getByRole('button', { name: 'Сбросить фильтры', exact: true }).click();
await page.getByTestId('apartment-card-demo-k1-204').waitFor();
await page.getByRole('button', { name: 'Чертежи', exact: true }).click();
await page.getByTestId('catalog-empty').waitFor();
await page.getByRole('button', { name: 'Сбросить фильтры', exact: true }).click();
await page.getByTestId('catalog-footer').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}/catalog-footer-375x812.png` });
const footer = await page.getByTestId('catalog-footer').boundingBox();
const pill = await page.getByTestId('floating-tab-bar').boundingBox();
if (footer.y + footer.height >= pill.y) throw new Error('Footer must be above the floating bar.');
await page.getByTestId('card-open-demo-k1-204').scrollIntoViewIfNeeded();
await page.getByTestId('card-open-demo-k1-204').click();
await page.waitForURL((url) => url.pathname === '/lead');
if (pageErrors.length) throw new Error(pageErrors.join('\n'));
await writeFile(`${out}/measurements.json`, JSON.stringify({ measurements, headerGaps, interactions: ['heart independent toggle', 'descending price sort', 'room filter and reset', 'blueprints honest empty', 'footer clears pill', 'existing lead navigation'], footer, pill, pageErrors }, null, 2) + '\n');
console.log(JSON.stringify({ measurements, headerGaps, footer, pill, pageErrors }, null, 2));
await browser.close();
