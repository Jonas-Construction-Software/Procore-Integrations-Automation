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
  });

  test("Uncheck all cost types and upload again", async () => {
    // 1. Navigate to Sync page (job already selected)
    await navigateToSyncPage(page);
    await selectSyncJob(page, 'LP0712');

    // 2. Uncheck all cost types and upload
    await setCostTypeCheckboxes(page, false);
    results.upload2 = await runSyncUpload(page);
    await page.waitForTimeout(3000);
  });

});
