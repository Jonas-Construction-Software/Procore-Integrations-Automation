import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { integratorLocators } from '../pageObjects/IntegratorObjects.js';
import { mappingsLocators } from '../pageObjects/MappingsObjects.js';

// ── Navigation ─────────────────────────────────────────────────────────────

/**
 * Click the Synchronization tab and wait for the /sync page to load.
 */
export async function navigateToSyncPage(page) {
  await page.click(integratorLocators.synchronizationTab);
  await page.waitForURL('**/sync', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
}

// ── Job Selection ──────────────────────────────────────────────────────────

/**
 * Type a job number into the sync multiselect, click the matching popup item,
 * and confirm the chip appears.
 */
export async function selectSyncJob(page, jobNumber) {
  const chip = page.locator(`kendo-multiselect .k-chip-label:has-text("${jobNumber}")`);

  // Already selected — nothing to do
  if (await chip.isVisible()) return;

  const jobInput = page.locator(integratorLocators.syncJobMultiselectInput);
  await jobInput.waitFor({ state: 'visible', timeout: 15000 });
  await jobInput.click();
  await jobInput.fill(jobNumber);

  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await popup.first().waitFor({ state: 'visible', timeout: 15000 });
  await popup.filter({ hasText: jobNumber }).first().click();

  await chip.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(3000);
}

// ── Checkboxes ─────────────────────────────────────────────────────────────

/**
 * Check or uncheck all three cost-type checkboxes and assert their state.
 * @param {boolean} checked - true to check, false to uncheck
 */
export async function setCostTypeCheckboxes(page, checked) {
  const selectors = [
    integratorLocators.syncRequisitionsCheckbox,
    integratorLocators.syncPaymentsCheckbox,
    integratorLocators.syncDirectCostsCheckbox,
  ];
  for (const sel of selectors) {
    checked ? await page.check(sel) : await page.uncheck(sel);
  }
  for (const sel of selectors) {
    checked
      ? await expect(page.locator(sel)).toBeChecked()
      : await expect(page.locator(sel)).not.toBeChecked();
  }
}

// ── Date Inputs ────────────────────────────────────────────────────────────

/**
 * Click at the month segment of a Kendo date input and type MMDDYYYY.
 * The 2-digit segments auto-advance to the next segment.
 */
export async function setKendoDateInput(page, locator, kendoDateStr) {
  await locator.click({ position: { x: 5, y: 10 } });
  await page.waitForTimeout(150);
  await locator.pressSequentially(kendoDateStr, { delay: 150 });
  await page.waitForTimeout(300);
}

/**
 * Set all 6 date fields (start + end for each cost type) and assert values.
 * @param {string} kendoStart  - MMDDYYYY string for start date
 * @param {string} kendoEnd    - MMDDYYYY string for end date
 * @param {string} displayStart - M/D/YYYY string for assertion
 * @param {string} displayEnd   - M/D/YYYY string for assertion
 */
export async function setSyncDateRanges(page, kendoStart, kendoEnd, displayStart, displayEnd) {
  const rows = [
    integratorLocators.syncRequisitionsDateInputs,
    integratorLocators.syncPaymentsDateInputs,
    integratorLocators.syncDirectCostsDateInputs,
  ];
  for (const row of rows) {
    await setKendoDateInput(page, page.locator(row).nth(0), kendoStart);
    await setKendoDateInput(page, page.locator(row).nth(1), kendoEnd);
  }
  for (const row of rows) {
    await expect(page.locator(row).nth(0)).toHaveValue(displayStart);
    await expect(page.locator(row).nth(1)).toHaveValue(displayEnd);
  }
}

// ── Upload Cycle ───────────────────────────────────────────────────────────

/**
 * Click Upload Now, wait for completion, and return structured capture:
 * { prePushState, apiCalls, issues }
 */
export async function runSyncUpload(page) {
  let syncResponse = null;
  const apiCalls   = [];

  // Capture last-sync timestamp before this push
  const prePushState = await page.evaluate(async () => {
    try {
      const token = sessionStorage.getItem('BearerToken');
      const res = await fetch('/api/sync/to-procore', {
        method: 'GET',
        headers: { 'BearerToken': token, 'Content-Type': 'application/json' },
      });
      return res.ok ? await res.json() : { error: `HTTP ${res.status}` };
    } catch (e) {
      return { error: String(e) };
    }
  });

  const onRequest = req => {
    if (req.resourceType() !== 'xhr' && req.resourceType() !== 'fetch') return;
    const url  = req.url();
    const body = req.postData();
    let bodyParsed = null;
    try { bodyParsed = body ? JSON.parse(body) : null; } catch { bodyParsed = body; }
    apiCalls.push({ method: req.method(), url, requestBody: bodyParsed });
  };

  const onResponse = async res => {
    if (res.request().resourceType() !== 'xhr' && res.request().resourceType() !== 'fetch') return;
    const url = res.url();
    let body = null;
    try { body = await res.json(); } catch { try { body = await res.text(); } catch { body = null; } }
    const entry = apiCalls.findLast(c => c.url === url);
    if (entry) entry.responseBody = body;
  };

  page.on('request',  onRequest);
  page.on('response', onResponse);

  await page.click(integratorLocators.syncUploadNowButton);
  const uploadBtn = page.locator(integratorLocators.syncUploadNowButton);
  // Wait for button to be re-enabled as the durable completion signal for the upload
  await expect(uploadBtn).toBeEnabled({ timeout: 120000 });

  page.off('request',  onRequest);
  page.off('response', onResponse);

  const pageErrorMsg     = await page.locator('.errorMessageColor').textContent().catch(() => '');
  const pageSummaryItems = await page
    .locator('button:has-text("Upload Now") ~ p, button:has-text("Upload Now") ~ div p')
    .allTextContents().catch(() => []);

  const issues = [];
  const syncCall = apiCalls.find(c => c.method === 'POST' && c.url.includes('/api/sync/to-procore'));
  syncResponse = syncCall?.responseBody ?? null;
  if (syncResponse) {
    if (syncResponse.error) issues.push({ level: 'top', message: syncResponse.error });
    for (const detail of syncResponse.details ?? []) {
      for (const err of detail.error_details ?? []) {
        issues.push({ level: 'job', company: detail.company_code, job: detail.job_number, message: err });
      }
    }
  }
  if (pageErrorMsg?.trim()) issues.push({ level: 'page', message: pageErrorMsg.trim() });
  pageSummaryItems.filter(t => t.trim()).forEach(t => issues.push({ level: 'page-summary', message: t.trim() }));

  return {
    prePushState,
    apiCalls,
    issues: issues.length ? issues : 'none',
  };
}

// ── File Output ────────────────────────────────────────────────────────────

/**
 * Save upload results to Data/<prefix>-<timestamp>.json.
 * @param {object} results - Object to serialize (e.g. { upload1, upload2 })
 * @param {string} prefix  - Filename prefix (default 'upload-payload')
 */
export function saveUploadResults(results, prefix = 'upload-payload') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dataDir   = path.join(process.cwd(), 'Data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const filePath = path.join(dataDir, `${prefix}-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  return filePath;
}
