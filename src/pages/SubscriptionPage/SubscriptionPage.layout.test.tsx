/**
 * @vitest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync as readSource } from 'node:fs';

const subscriptionPageScss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'SubscriptionPage.module.scss'),
  'utf8',
);
const appScss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../App.module.scss'),
  'utf8',
);
const subscriptionPageSource = readSource(
  join(dirname(fileURLToPath(import.meta.url)), 'SubscriptionPage.tsx'),
  'utf8',
);

describe('SubscriptionPage mobile layout', () => {
  it('keeps install prompt inside main before the legal footer', () => {
    const mainOpen = subscriptionPageSource.indexOf('<main className={styles.main}>');
    const pwaMarker = 'PwaInstallPrompt variant="section"';
    const mainClose = subscriptionPageSource.indexOf('</main>', mainOpen);
    const pwaIndex = subscriptionPageSource.indexOf(pwaMarker);
    const footerIndex = subscriptionPageSource.indexOf('<CabinetLegalFooter />');

    expect(mainOpen).toBeGreaterThan(-1);
    expect(pwaIndex).toBeGreaterThan(mainOpen);
    expect(pwaIndex).toBeLessThan(mainClose);
    expect(footerIndex).toBeGreaterThan(mainClose);
  });

  it('prevents footer overlap via non-shrinking bottom stack and clip overflow', () => {
    expect(subscriptionPageScss).toMatch(/overflow-x:\s*clip/);
    expect(subscriptionPageScss).toMatch(/\.main[\s\S]*flex:\s*1\s*0\s*auto/);
    expect(subscriptionPageScss).toMatch(/\.main[\s\S]*flex-shrink:\s*0/);
    expect(subscriptionPageScss).toMatch(/\.pageShell\s*>\s*footer[\s\S]*flex-shrink:\s*0/);
    expect(subscriptionPageScss).toMatch(/\.pwaInstallSection[\s\S]*flex-shrink:\s*0/);
  });

  it('lets cabinet content grow with the page scroll container', () => {
    expect(appScss).toMatch(/\.appContentCabinet[\s\S]*flex:\s*1\s*1\s*auto/);
  });
});
