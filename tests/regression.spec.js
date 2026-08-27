import test from "../Actions/Hooks.js";
import { mappingsLocators } from "../pageObjects/MappingsObjects.js";
import { integratorLocators } from "../pageObjects/IntegratorObjects.js";
import { expect } from '@playwright/test';
import {
  fillScoMappingForm, verifyResultDropdown,
  fillPoMappingForm,
  fillSupplierMappingForm,
  fillJobsMappingForm, verifyJobsResultDropdown,
} from '../Helper/MappingsHelper.js';
import Screenshot from '../Utils/Screenshot.js';

test.describe.configure({ mode: 'serial' });

// ─── Regression Tests ────────────────────────────────────────────────────────
//
// These tests cover scenarios intentionally NOT in smoketests.spec.js:
//   - Events grid renders actual data rows (not just column headers)
//   - SCO: Jonas result DD populates after a Procore entry is selected
//   - PO:  Procore mapped-entries column (second DD) has options when Include Mapped is ON
//   - Supplier: Jonas mapped-entries column (second DD) has options when Include Mapped is ON
//   - Jobs: Include Mapped Entries checkbox shows mapped jobs
//   - Jobs: Include Inactive Jobs + Include Mapped Entries checkboxes combined

test.describe("Regression Tests", { tag: ['@regression'] }, () => {

  // ── Events Grid ──────────────────────────────────────────────────────────

  test("Verify events grid loads with at least one data row", async ({ page }) => {
    await page.waitForSelector(integratorLocators.eventsGrid, { timeout: 15000 });
    const rows = page.locator('kendo-grid tbody tr:not(.k-grid-norecords)');
    await rows.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await rows.count();
    await Screenshot.takeScreenshot(page, 'Events_Grid_Data_Rows', 'Passed');
    expect(count).toBeGreaterThan(0);
  });

  test("Verify all events grid column headers are visible", async ({ page }) => {
    await page.waitForSelector(integratorLocators.eventsGrid, { timeout: 15000 });

    const columns = [
      ['ID',             integratorLocators.colIdHeader],
      ['Resource Id',    integratorLocators.colResourceIdHeader],
      ['Received At',    integratorLocators.colReceivedAtHeader],
      ['Handled At',     integratorLocators.colHandledAtHeader],
      ['Message Type',   integratorLocators.colMessageTypeHeader],
      ['Action Type',    integratorLocators.colActionTypeHeader],
      ['Json Payload',   integratorLocators.colJsonPayloadHeader],
      ['Status',         integratorLocators.colStatusHeader],
      ['Status Message', integratorLocators.colStatusMessageHeader],
      ['Error Details',  integratorLocators.colErrorDetailsHeader],
    ];

    for (const [label, locator] of columns) {
      await test.step(label, async () => {
        await expect(page.locator(locator).first()).toBeVisible({ timeout: 10000 });
      });
    }
  });

  // ── SCO Mapping ──────────────────────────────────────────────────────────

  test("Verify SCO Mapping - Jonas result DD populates after selecting a Procore entry with Include Mapped", async ({ page }) => {
    await fillScoMappingForm(page, {
      procoreSubcontractText: 'SC0418',
      jonasSubcontractText:   '000306',
    });

    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    // Smoke tests only assert the Procore result DD is blank for certain entries.
    // Here we verify that selecting 'CE #014' from the Procore result DD causes the
    // Jonas result DD to appear and be populated (populateJonasResult = true).
    const { jonasCount } = await verifyResultDropdown(
      page,
      'CE #014',
      'SCO_Regression_Jonas_DD_Populated',
      /*populateJonasResult=*/ true,
      /*procoreEntryToSelect=*/ 'CE #014',
    );
    expect(jonasCount).toBeGreaterThan(0);
  });

  // ── PO Mapping ───────────────────────────────────────────────────────────

  test("Verify PO Mapping - Procore mapped entries column has options when Include Mapped is ON", async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    await fillPoMappingForm(page);

    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    // Smoke tests only check the Jonas entries column (poResultDD).
    // This test verifies the Procore entries column (poProcoreMappedResultDD) is populated.
    await page.click(mappingsLocators.poProcoreMappedResultDD);
    const popup = page.locator(mappingsLocators.dropdownPopupItems);
    await popup.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await popup.count();
    await Screenshot.takeScreenshot(page, 'PO_Regression_Procore_Mapped_Column', 'Passed');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    expect(count).toBeGreaterThan(0);
  });

  // ── Supplier Mapping ─────────────────────────────────────────────────────

  test("Verify Supplier Mapping - Jonas mapped entries column has options when Include Mapped is ON", async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    await fillSupplierMappingForm(page);

    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    // Smoke tests only check the Procore entries column (supplierResultDD).
    // This test verifies the Jonas mapped entries column (supplierJonasMappedResultDD) is populated.
    await page.click(mappingsLocators.supplierJonasMappedResultDD);
    const popup = page.locator(mappingsLocators.dropdownPopupItems);
    await popup.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await popup.count();
    await Screenshot.takeScreenshot(page, 'Supplier_Regression_Jonas_Mapped_Column', 'Passed');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    expect(count).toBeGreaterThan(0);
  });

  // ── Projects - Jobs Mapping ───────────────────────────────────────────────

  test("Verify Jobs Mapping - Include Mapped Entries shows mapped jobs", async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Smoke tests only test the Include Inactive Jobs checkbox.
    // This test verifies the Include Mapped Entries checkbox surfaces mapped jobs.
    await fillJobsMappingForm(page);

    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    const count = await verifyJobsResultDropdown(
      page, 'LP0712', 'Jobs_Regression_Include_Mapped_Entries'
    );
    expect(count).toBeGreaterThan(0);
  });

  test("Verify Jobs Mapping - Include Inactive Jobs and Include Mapped Entries active simultaneously", async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    await fillJobsMappingForm(page);

    await page.check(mappingsLocators.includeInactiveJobsCheckbox);
    await page.waitForTimeout(1000);
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    // With both checkboxes active the result DD must still surface the known inactive job.
    const count = await verifyJobsResultDropdown(
      page, 'FROZJ', 'Jobs_Regression_Inactive_And_Mapped_Combined'
    );
    expect(count).toBeGreaterThan(0);
  });

  // ── IN-775: Synchronization Page – Job Upload Selection ──────────────────

  test("IN-775: Verify sync page loads, job LP0712 can be selected in the upload multiselect", async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Navigate to the Synchronization page
    await page.click(integratorLocators.syncTab);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(integratorLocators.syncJobMultiselect, { timeout: 15000 });

    // Click the job multiselect to open the filter input
    await page.click(integratorLocators.syncJobMultiselect);
    await page.waitForSelector(integratorLocators.syncJobMultiselectInput, { state: 'visible', timeout: 10000 });
    await page.locator(integratorLocators.syncJobMultiselectInput).type('LP0712', { delay: 80 });
    await page.waitForTimeout(1500);

    // Select LP0712 from the filtered dropdown list
    const jobItem = page.locator("kendo-popup kendo-list li.k-list-item").filter({ hasText: /^LP0712$/ }).first();
    await jobItem.waitFor({ state: 'visible', timeout: 15000 });
    await jobItem.click();

    // Confirm the chip/tag appears in the multiselect
    const selectedTag = page.locator(".col-md-4.col-sm-12 kendo-multiselect kendo-taglist").first();
    await expect(selectedTag).toContainText('LP0712', { timeout: 10000 });

    await Screenshot.takeScreenshot(page, 'IN775_Sync_Job_LP0712_Selected', 'Passed');

    // Hold the browser state for 5 seconds as required
    await page.waitForTimeout(5000);
  });

});
