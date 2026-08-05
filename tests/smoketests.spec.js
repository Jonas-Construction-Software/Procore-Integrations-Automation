import test from "../Actions/Hooks.js";
import { loginPageLocators } from "../pageObjects/LoginObjects.js";
import { mappingsLocators } from "../pageObjects/MappingsObjects.js";
import { integratorLocators } from "../pageObjects/IntegratorObjects.js";
import { expect } from '@playwright/test';
import { fillScoMappingForm, verifyResultDropdown, fillPccoMappingForm, verifyPccoResultDropdown, fillSubcontractMappingForm, verifySubcontractResultDropdown, fillPoMappingForm, verifyPoResultDropdown, fillSupplierMappingForm, verifySupplierResultDropdown, fillJobsMappingForm, verifyJobsResultDropdown } from '../Helper/MappingsHelper.js';
import { sortColumnAndVerify } from '../Helper/IntegrationHelper.js';

test.describe.configure({ mode: 'serial' });

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe("Smoke Tests", { tag: ['@smoke'] }, () => {

  test("Verify user can login successfully", async ({ page }) => {
    await expect(page).toHaveTitle(loginPageLocators.pageTitle, { timeout: 60000 });
  });

  test("Verify all columns are sortable", async ({ page }) => {
    await page.waitForSelector(integratorLocators.eventsGrid, { timeout: 15000 });

    const columns = [
      ['ID column',             integratorLocators.colIdHeader,            'Integration_ID_Column'],
      ['Resource Id column',    integratorLocators.colResourceIdHeader,    'Integration_ResourceId_Column'],
      ['Received At column',    integratorLocators.colReceivedAtHeader,    'Integration_ReceivedAt_Column'],
      ['Handled At column',     integratorLocators.colHandledAtHeader,     'Integration_HandledAt_Column'],
      ['Message Type column',   integratorLocators.colMessageTypeHeader,   'Integration_MessageType_Column'],
      ['Action Type column',    integratorLocators.colActionTypeHeader,    'Integration_ActionType_Column'],
      ['Json Payload column',   integratorLocators.colJsonPayloadHeader,   'Integration_JsonPayload_Column'],
      ['Status column',         integratorLocators.colStatusHeader,        'Integration_Status_Column'],
      ['Status Message column', integratorLocators.colStatusMessageHeader, 'Integration_StatusMessage_Column'],
      ['Error Details column',  integratorLocators.colErrorDetailsHeader,  'Integration_ErrorDetails_Column'],
    ];

    for (const [label, locator, prefix] of columns) {
      await test.step(label, () => sortColumnAndVerify(page, locator, prefix));
    }
  });

  test("Verify Mappings first dropdown has multiple options", async ({ page }) => {
    await page.click(mappingsLocators.mappingsTab);
    await page.waitForLoadState("domcontentloaded");
    await page.click(mappingsLocators.firstDropdown);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  });

  for (const [label, typeOptLocator, mappingDDLocator] of [
    ['SubContracts ChangeOrder', mappingsLocators.scoTypeOption,  mappingsLocators.scoFirstMappingDropdown],
    ['Subcontracts',             mappingsLocators.subTypeOption,  mappingsLocators.subFirstMappingDropdown],
    ['Purchase orders',          mappingsLocators.poTypeOption,   mappingsLocators.poFirstMappingDropdown],
    ['Projects - Jobs',          mappingsLocators.jobsTypeOption, mappingsLocators.jobsFirstMappingDropdown],
  ]) {
    test(`Verify ${label} mapping first dropdown has multiple options`, async ({ page }) => {
      await page.click(mappingsLocators.mappingsTab);
      await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
      await page.click(mappingsLocators.firstDropdown);
      const typeOption = page.locator(typeOptLocator);
      await typeOption.waitFor({ state: 'visible', timeout: 15000 });
      await typeOption.click();
      await page.waitForSelector('(//kendo-dropdownlist)[2]', { timeout: 15000 });
      await page.click(mappingDDLocator);
      const options = page.locator(mappingsLocators.dropdownPopupItems);
      await options.first().waitFor({ state: 'visible', timeout: 15000 });
      const count = await options.count();
      expect(count).toBeGreaterThan(1);
    });
  }

  test("Verify SCO Mapping - Procore result dropdown is blank for unmapped entries", async ({ page }) => {
    const scenarios = [
      { procoreSubcontractText: 'SC0418',   jonasSubcontractText: '000306' },
      { procoreSubcontractText: 'SC0710-1', jonasSubcontractText: '000304' },
    ];

    for (const [i, scenario] of scenarios.entries()) {
      if (i > 0) {
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(1000);
      }

      await fillScoMappingForm(page, scenario);
      const tag = scenario.procoreSubcontractText;

      const countNoCheckbox = await verifyResultDropdown(page, tag, `SCO_${tag}_Without_Include_Mapped_Entries`);
      expect(countNoCheckbox).toBe(0);

      await page.check(mappingsLocators.includeMappedEntriesCheckbox);
      await page.waitForTimeout(1000);
      const countWithCheckbox = await verifyResultDropdown(page, tag, `SCO_${tag}_With_Include_Mapped_Entries`, true, 'CE #014');
      expect(countWithCheckbox).toBe(0);
    }
  });

  test("Verify PCCO Mapping - result dropdown contains expected entries", async ({ page }) => {
    for (const run of ['A', 'B']) {
      if (run === 'B') {
        await page.reload();
        await page.waitForLoadState('load');
        await page.waitForTimeout(1000);
      }

      await fillPccoMappingForm(page);

      const countUnmapped = await verifyPccoResultDropdown(page, 'PCCO 0329-015', `PCCO_${run}_Without_Include_Mapped_Entries`);
      expect(countUnmapped).toBeGreaterThan(0);

      await page.check(mappingsLocators.includeMappedEntriesCheckbox);
      await page.waitForTimeout(1000);
      const countMapped = await verifyPccoResultDropdown(page, 'PCCO123456', `PCCO_${run}_With_Include_Mapped_Entries`);
      expect(countMapped).toBeGreaterThan(0);
    }
  });

  test("Verify Subcontract Mapping - unmapped entry visible, mapped entry visible with Include Mapped Entries", async ({ page }) => {
    // ── Scenario 1: without Include Mapped Entries ────────────────────────────
    // Entry "A_b!235" is unmapped and SHOULD appear in the result DD
    await fillSubcontractMappingForm(page);

    const countWithout = await verifySubcontractResultDropdown(
      page, 'A_b!235', 'Sub_Without_Include_Mapped_Entries'
    );
    expect(countWithout).toBeGreaterThan(0);

    // ── Scenario 2: with Include Mapped Entries checked ──────────────────────
    // Entry "000322" is a mapped entry and should also be visible when Include Mapped is ON
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    const countWith = await verifySubcontractResultDropdown(
      page, '000322', 'Sub_With_Include_Mapped_Entries'
    );
    expect(countWith).toBeGreaterThan(0);
  });

  test("Verify Purchase Order Mapping - unmapped entry visible, mapped entry visible with Include Mapped Entries", async ({ page }) => {
    // ── Scenario 1: without Include Mapped Entries ────────────────────────────
    // Entry "PO0311" is unmapped and SHOULD appear in the result DD
    await fillPoMappingForm(page);

    const countWithout = await verifyPoResultDropdown(
      page, 'PO0311', 'PO_Without_Include_Mapped_Entries'
    );
    expect(countWithout).toBeGreaterThan(0);

    // ── Scenario 2: with Include Mapped Entries checked ──────────────────────
    // Entry "PO0110" is a mapped entry and should also be visible when Include Mapped is ON
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    const countWith = await verifyPoResultDropdown(
      page, 'PO0110', 'PO_With_Include_Mapped_Entries'
    );
    expect(countWith).toBeGreaterThan(0);
  });

  test("Verify Supplier mapping first dropdown has multiple options", async ({ page }) => {
    await page.click(mappingsLocators.mappingsTab);
    await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
    await page.click(mappingsLocators.firstDropdown);
    const supplierTypeOption = page.locator(mappingsLocators.supplierTypeOption);
    await supplierTypeOption.waitFor({ state: 'visible', timeout: 15000 });
    await supplierTypeOption.click();
    await page.waitForFunction(
      () => document.querySelectorAll('.k-animation-container-shown').length === 0,
      { timeout: 8000 }
    ).catch(() => {});
    await page.waitForTimeout(800);
    const supplierRadio = page.locator(mappingsLocators.supplierRadio);
    await supplierRadio.waitFor({ state: 'visible', timeout: 10000 });
    await supplierRadio.check({ force: true });
    await page.waitForSelector('(//kendo-dropdownlist)[2]', { timeout: 15000 });
    await page.click(mappingsLocators.supplierJonasCompanyDD);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  });

  test("Verify Supplier Mapping - unmapped entry visible, mapped Procore entry visible with Include Mapped Entries", async ({ page }) => {
    // ── Scenario 1: without Include Mapped Entries ────────────────────────────
    // Entry "ABCSUPUS" is an unmapped Jonas supplier and SHOULD appear in the result DD
    await fillSupplierMappingForm(page);

    const countWithout = await verifySupplierResultDropdown(
      page, 'ABCSUPUS', 'Supplier_Without_Include_Mapped_Entries'
    );
    expect(countWithout).toBeGreaterThan(0);

    // ── Scenario 2: with Include Mapped Entries checked ──────────────────────
    // Entry "ABC-MAN" is a Procore supplier and should appear in the left (Procore)
    // column of the result DD when Include Mapped is ON
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);

    const countWith = await verifySupplierResultDropdown(
      page, 'ABC-MAN', 'Supplier_With_Include_Mapped_Entries'
    );
    expect(countWith).toBeGreaterThan(0);
  });

  test("Verify Projects - Jobs mapping - active jobs visible, inactive jobs appear with Include Inactive Jobs", async ({ page }) => {
    // ── Scenario 1: Include Inactive Jobs OFF ─────────────────────────────────
    // Active job "003321" should appear in the result DD by default
    await fillJobsMappingForm(page);

    const countWithout = await verifyJobsResultDropdown(
      page, '003321', 'Jobs_Without_Include_Inactive'
    );
    expect(countWithout).toBeGreaterThan(0);

    // ── Scenario 2: Include Inactive Jobs ON ─────────────────────────────────
    // Inactive job "FROZJ" should appear ONLY when Include Inactive Jobs is checked
    await page.check(mappingsLocators.includeInactiveJobsCheckbox);
    await page.waitForTimeout(1000);

    const countWith = await verifyJobsResultDropdown(
      page, 'FROZJ', 'Jobs_With_Include_Inactive'
    );
    expect(countWith).toBeGreaterThan(0);
  });

});
