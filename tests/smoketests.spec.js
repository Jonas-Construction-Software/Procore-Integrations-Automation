import test from "../Actions/Hooks.js";
import '../Actions/Hooks.js';
import { AppConfig } from "../config.js";
import ActionsHelper from "../Actions/ActionHelper.js";
import { ActionTypes, AssertionType } from "../Utils/actions.js";
import { loginPageLocators } from "../pageObjects/LoginObjects.js";
import { mappingsLocators } from "../pageObjects/MappingsObjects.js";
import { integratorLocators } from "../pageObjects/IntegratorObjects.js";
import { expect } from '@playwright/test';
import { selectKendoOption, fillScoMappingForm, verifyResultDropdown, fillPccoMappingForm, verifyPccoResultDropdown, fillSubcontractMappingForm, verifySubcontractResultDropdown, fillPoMappingForm, verifyPoResultDropdown, fillSupplierMappingForm, verifySupplierResultDropdown, fillJobsMappingForm, verifyJobsResultDropdown } from '../Helper/MappingsHelper.js';
import { sortColumnAndVerify } from '../Helper/IntegrationHelper.js';



// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe("Smoke Tests", { tag: ['@smoke'] }, () => {

  test("Verify user can login successfully", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await expect(page).toHaveTitle(loginPageLocators.pageTitle, { timeout: 60000 });
  });

  test("Verify Mappings first dropdown has multiple options", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.CLICKVIAJS, mappingsLocators.mappingsTab);
    await page.waitForLoadState("domcontentloaded");
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.firstDropdown);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  });

  test("Verify SubContracts ChangeOrder mapping first dropdown has multiple options", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.CLICKVIAJS, mappingsLocators.mappingsTab);
    await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.firstDropdown);
    const scoOption = page.locator(mappingsLocators.scoTypeOption);
    await scoOption.waitFor({ state: 'visible', timeout: 15000 });
    await scoOption.click();
    await page.waitForSelector('(//kendo-dropdownlist)[2]', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.scoFirstMappingDropdown);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
  });

  test("Verify SCO Mapping - Procore result dropdown is blank for unmapped entries", async ({ page }) => {
    // ── Scenario 1: Procore SC0418 mapped to Jonas 000306 ───────────────────
    await fillScoMappingForm(page, {
      procoreSubcontractText: 'SC0418',
      jonasSubcontractText: '000306',
    });

    // Without "Include Mapped Entries" checkbox
    const countSC0418NoCheckbox = await verifyResultDropdown(
      page, 'SC0418', 'SCO_SC0418_Without_Include_Mapped_Entries'
    );
    expect(countSC0418NoCheckbox).toBe(0);

    // With "Include Mapped Entries" checkbox checked
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);
    const countSC0418WithCheckbox = await verifyResultDropdown(
      page, 'SC0418', 'SCO_SC0418_With_Include_Mapped_Entries', true, 'CE #014'
    );
    expect(countSC0418WithCheckbox).toBe(0);

    // ── Reload for Scenario 2 ────────────────────────────────────────────────
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // ── Scenario 2: Procore SC0710-1 mapped to Jonas 000304 ─────────────────
    await fillScoMappingForm(page, {
      procoreSubcontractText: 'SC0710-1',
      jonasSubcontractText: '000304',
    });

    // Without "Include Mapped Entries" checkbox
    const countSC07101NoCheckbox = await verifyResultDropdown(
      page, 'SC0710-1', 'SCO_SC0710-1_Without_Include_Mapped_Entries'
    );
    expect(countSC07101NoCheckbox).toBe(0);

    // With "Include Mapped Entries" checkbox checked
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);
    const countSC07101WithCheckbox = await verifyResultDropdown(
      page, 'SC0710-1', 'SCO_SC0710-1_With_Include_Mapped_Entries', true, 'CE #014'
    );
    expect(countSC07101WithCheckbox).toBe(0);
  });

  test("Verify PCCO Mapping - result dropdown contains expected entries", async ({ page }) => {
    // ── Scenario A: first run ────────────────────────────────────────────────
    await fillPccoMappingForm(page);

    // Without "Include Mapped Entries" – look for PCCO 0329-015 (expected: present)
    const countA_Unmapped = await verifyPccoResultDropdown(
      page, 'PCCO 0329-015', 'PCCO_A_Without_Include_Mapped_Entries'
    );
    expect(countA_Unmapped).toBeGreaterThan(0);

    // With "Include Mapped Entries" checked – look for PCCO123456 (expected: present)
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);
    const countA_Mapped = await verifyPccoResultDropdown(
      page, 'PCCO123456', 'PCCO_A_With_Include_Mapped_Entries'
    );
    expect(countA_Mapped).toBeGreaterThan(0);

    // ── Reload for Scenario B ────────────────────────────────────────────────
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // ── Scenario B: second run (fresh page, same entries) ────────────────────
    await fillPccoMappingForm(page);

    // Without "Include Mapped Entries" – look for PCCO 0329-015
    const countB_Unmapped = await verifyPccoResultDropdown(
      page, 'PCCO 0329-015', 'PCCO_B_Without_Include_Mapped_Entries'
    );
    expect(countB_Unmapped).toBeGreaterThan(0);

    // With "Include Mapped Entries" checked – look for PCCO123456
    await page.check(mappingsLocators.includeMappedEntriesCheckbox);
    await page.waitForTimeout(1000);
    const countB_Mapped = await verifyPccoResultDropdown(
      page, 'PCCO123456', 'PCCO_B_With_Include_Mapped_Entries'
    );
    expect(countB_Mapped).toBeGreaterThan(0);
  });

  test("Verify Subcontracts mapping first dropdown has multiple options", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.CLICKVIAJS, mappingsLocators.mappingsTab);
    await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.firstDropdown);
    const subOption = page.locator(mappingsLocators.subTypeOption);
    await subOption.waitFor({ state: 'visible', timeout: 15000 });
    await subOption.click();
    await page.waitForSelector('(//kendo-dropdownlist)[2]', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.subFirstMappingDropdown);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
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

  test("Verify Purchase orders mapping first dropdown has multiple options", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.CLICKVIAJS, mappingsLocators.mappingsTab);
    await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.firstDropdown);
    const poOption = page.locator(mappingsLocators.poTypeOption);
    await poOption.waitFor({ state: 'visible', timeout: 15000 });
    await poOption.click();
    await page.waitForSelector('(//kendo-dropdownlist)[2]', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.poFirstMappingDropdown);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
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
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.CLICKVIAJS, mappingsLocators.mappingsTab);
    await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.firstDropdown);
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
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.supplierJonasCompanyDD);
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

  test("Verify Projects - Jobs mapping first dropdown has multiple options", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.CLICKVIAJS, mappingsLocators.mappingsTab);
    await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.firstDropdown);
    const jobsOption = page.locator(mappingsLocators.jobsTypeOption);
    await jobsOption.waitFor({ state: 'visible', timeout: 15000 });
    await jobsOption.click();
    await page.waitForSelector('(//kendo-dropdownlist)[2]', { timeout: 15000 });
    await actionHelper.actionMethod(ActionTypes.CLICK, mappingsLocators.jobsFirstMappingDropdown);
    const options = page.locator(mappingsLocators.dropdownPopupItems);
    await options.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(1);
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

// ─── Integration Page – Column Sorting ──────────────────────────────────────

test.describe("Integration Page - Column Sorting", { tag: ['@smoke'] }, () => {

  // All columns are verified in a single test so only one browser/page is opened.
  // Each column is tested as a named step, visible in the Playwright report.
  test("Verify all columns are sortable", async ({ page }) => {
    await page.waitForSelector(integratorLocators.eventsGrid, { timeout: 15000 });

    await test.step("ID column", () =>
      sortColumnAndVerify(page, integratorLocators.colIdHeader, 'Integration_ID_Column'));

    await test.step("Resource Id column", () =>
      sortColumnAndVerify(page, integratorLocators.colResourceIdHeader, 'Integration_ResourceId_Column'));

    await test.step("Received At column", () =>
      sortColumnAndVerify(page, integratorLocators.colReceivedAtHeader, 'Integration_ReceivedAt_Column'));

    await test.step("Handled At column", () =>
      sortColumnAndVerify(page, integratorLocators.colHandledAtHeader, 'Integration_HandledAt_Column'));

    await test.step("Message Type column", () =>
      sortColumnAndVerify(page, integratorLocators.colMessageTypeHeader, 'Integration_MessageType_Column'));

    await test.step("Action Type column", () =>
      sortColumnAndVerify(page, integratorLocators.colActionTypeHeader, 'Integration_ActionType_Column'));

    await test.step("Json Payload column", () =>
      sortColumnAndVerify(page, integratorLocators.colJsonPayloadHeader, 'Integration_JsonPayload_Column'));

    await test.step("Status column", () =>
      sortColumnAndVerify(page, integratorLocators.colStatusHeader, 'Integration_Status_Column'));

    await test.step("Status Message column", () =>
      sortColumnAndVerify(page, integratorLocators.colStatusMessageHeader, 'Integration_StatusMessage_Column'));

    await test.step("Error Details column", () =>
      sortColumnAndVerify(page, integratorLocators.colErrorDetailsHeader, 'Integration_ErrorDetails_Column'));
  });

});
