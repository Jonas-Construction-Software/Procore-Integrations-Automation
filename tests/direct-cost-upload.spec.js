import { test, expect } from "@playwright/test";
import Login from "../Helper/Login.js";
import {
  navigateToSyncPage,
  selectSyncJob,
  setCostTypeCheckboxes,
  setSyncDateRanges,
  runSyncUpload,
  saveUploadResults,
} from "../Helper/SyncHelper.js";

// ── Date constants ─────────────────────────────────────────────────────────
const START_DATE_KENDO   = '07212026';
const START_DATE_DISPLAY = '7/21/2026';

function buildTodayKendo() {
  const today = new Date();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  const yyyy  = String(today.getFullYear());
  return {
    kendo:   `${mm}${dd}${yyyy}`,
    display: `${today.getMonth() + 1}/${today.getDate()}/${yyyy}`,
  };
}

function buildTomorrowKendo() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd   = String(tomorrow.getDate()).padStart(2, '0');
  const yyyy = String(tomorrow.getFullYear());
  return {
    kendo:   `${mm}${dd}${yyyy}`,
    display: `${tomorrow.getMonth() + 1}/${tomorrow.getDate()}/${yyyy}`,
  };
}

function buildYesterdayKendo() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const mm   = String(yesterday.getMonth() + 1).padStart(2, '0');
  const dd   = String(yesterday.getDate()).padStart(2, '0');
  const yyyy = String(yesterday.getFullYear());
  return {
    kendo:   `${mm}${dd}${yyyy}`,
    display: `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yyyy}`,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.describe("Direct Cost Upload", { tag: ['@direct-cost-upload'] }, () => {
  let page;
  const results = {};

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await Login.loginToProcore(page);
  });

  test.afterAll(async () => {
    saveUploadResults(results);
    await page.context().close();
  });

  test("Navigate to Synchronization and select job LP0712 for cost upload", async () => {
    const yesterday = buildYesterdayKendo();

    // 1. Navigate to Sync page and select job
    await navigateToSyncPage(page);
    await selectSyncJob(page, 'LP0712');

    // 2. Check all three cost types + set dates (Jul 21 → yesterday)
    await setCostTypeCheckboxes(page, true);
    await setSyncDateRanges(page, START_DATE_KENDO, yesterday.kendo, START_DATE_DISPLAY, yesterday.display);

    // 3. Upload with all cost types checked
    results.upload1 = await runSyncUpload(page);
    await page.waitForTimeout(3000);

    // 4. Assert successful POST with no reported errors
    const syncCall1 = results.upload1.apiCalls.find(
      c => c.method === 'POST' && c.url.includes('/api/sync/to-procore')
    );
    expect(syncCall1, 'Expected a POST to /api/sync/to-procore').toBeTruthy();
    expect(syncCall1.responseBody, 'Expected a response body from the sync POST').toBeTruthy();
    expect(results.upload1.issues, 'Expected no errors from upload1').toBe('none');
  });

  test("Upload all cost types for LP0712 with end date set to tomorrow", async () => {
    const tomorrow = buildTomorrowKendo();

    // 1. Navigate to Sync page and select job
    await navigateToSyncPage(page);
    await selectSyncJob(page, 'LP0712');

    // 2. Check all three cost types + set both dates to tomorrow
    await setCostTypeCheckboxes(page, true);
    await setSyncDateRanges(page, tomorrow.kendo, tomorrow.kendo, tomorrow.display, tomorrow.display);

    // 3. Upload and capture full result
    results.uploadTomorrow = await runSyncUpload(page);
    await page.waitForTimeout(3000);

    // 4. Assert successful POST with no reported errors
    const syncCallTomorrow = results.uploadTomorrow.apiCalls.find(
      c => c.method === 'POST' && c.url.includes('/api/sync/to-procore')
    );
    expect(syncCallTomorrow, 'Expected a POST to /api/sync/to-procore').toBeTruthy();
    expect(syncCallTomorrow.responseBody, 'Expected a response body from the sync POST').toBeTruthy();
    expect(results.uploadTomorrow.issues, 'Expected no errors from uploadTomorrow').toBe('none');
  });

  test("Uncheck all cost types and upload again", async () => {
    // 1. Navigate to Sync page (job already selected)
    await navigateToSyncPage(page);
    await selectSyncJob(page, 'LP0712');

    // 2. Uncheck all cost types and upload
    await setCostTypeCheckboxes(page, false);
    results.upload2 = await runSyncUpload(page);
    await page.waitForTimeout(3000);

    // 3. Assert that no POST was sent (validation should prevent it)
    //    OR that the response indicates a validation/error condition
    const syncCall2 = results.upload2.apiCalls.find(
      c => c.method === 'POST' && c.url.includes('/api/sync/to-procore')
    );
    if (syncCall2) {
      // If a POST was sent, the response should indicate an error (nothing to sync)
      expect(
        results.upload2.issues,
        'Expected errors or validation message when no cost types are checked'
      ).not.toBe('none');
    } else {
      // No POST sent — the UI blocked submission; verify a validation message is shown
      const errorMsg = await page.locator('.errorMessageColor').textContent().catch(() => '');
      expect(
        errorMsg.trim(),
        'Expected a UI validation message when no cost types are checked'
      ).not.toBe('');
    }
  });

});
