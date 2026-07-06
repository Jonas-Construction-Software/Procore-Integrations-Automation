import { expect } from '@playwright/test';
import { integratorLocators } from '../pageObjects/IntegratorObjects.js';
import Screenshot from '../Utils/Screenshot.js';

/**
 * Click a column header once (ascending) then again (descending), asserting the
 * aria-sort attribute at each step and capturing a screenshot.
 * Falls back to checking for the Kendo sort-icon class if aria-sort is absent.
 */
export async function sortColumnAndVerify(page, columnLocator, screenshotPrefix) {
  const header = page.locator(columnLocator).first();
  await header.waitFor({ state: 'visible', timeout: 15000 });

  // ── First click → ascending ──────────────────────────────────────────────
  await header.click();
  await page.waitForTimeout(1000);
  await Screenshot.takeScreenshot(page, `${screenshotPrefix}_Sort_Ascending`, 'Passed');

  const ascSort = await header.getAttribute('aria-sort');
  if (ascSort !== null) {
    expect(ascSort).toBe('ascending');
  } else {
    // Fallback: Kendo renders a sort-asc icon inside the header
    const ascIcon = header.locator(`.${integratorLocators.sortAscClass}`);
    expect(await ascIcon.count()).toBeGreaterThan(0);
  }

  // ── Second click → descending ────────────────────────────────────────────
  await header.click();
  await page.waitForTimeout(1000);
  await Screenshot.takeScreenshot(page, `${screenshotPrefix}_Sort_Descending`, 'Passed');

  const descSort = await header.getAttribute('aria-sort');
  if (descSort !== null) {
    expect(descSort).toBe('descending');
  } else {
    const descIcon = header.locator(`.${integratorLocators.sortDescClass}`);
    expect(await descIcon.count()).toBeGreaterThan(0);
  }
}
