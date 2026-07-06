import { mappingsLocators } from '../pageObjects/MappingsObjects.js';
import Screenshot from '../Utils/Screenshot.js';

/**
 * Open a Kendo dropdownlist by XPath, wait for the popup, click the option
 * whose text contains `optionText`, then wait for the popup to close.
 */
export async function selectKendoOption(page, ddXpath, optionText) {
  await page.click(ddXpath);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await popup.first().waitFor({ state: 'visible', timeout: 15000 });
  await popup.filter({ hasText: optionText }).first().click();
  await popup.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
}

/**
 * Navigate to Mappings and fill the entire SCO mapping form in sequence.
 */
export async function fillScoMappingForm(page, {
  procoreSubcontractText,
  jonasSubcontractText,
  procoreProjectText = 'LP0712',
  jonasCompanyText = 'JT',
  subledgerText = 'AP',
  supplierText = 'ABCSUPP',
  jobsText = 'LP0712',
}) {
  await page.click(mappingsLocators.mappingsTab);
  await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });

  await selectKendoOption(page, mappingsLocators.firstDropdown, 'SubContracts ChangeOrder');

  await page.waitForSelector(mappingsLocators.scoProjectDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoProjectDD, procoreProjectText);

  await page.waitForSelector(mappingsLocators.scoProSubcontractsDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoProSubcontractsDD, procoreSubcontractText);

  await page.waitForSelector(mappingsLocators.scoJonasCompanyDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoJonasCompanyDD, jonasCompanyText);

  await page.waitForSelector(mappingsLocators.scoSubledgerDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoSubledgerDD, subledgerText);

  await page.waitForSelector(mappingsLocators.scoSupplierDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoSupplierDD, supplierText);

  await page.waitForSelector(mappingsLocators.scoJobsDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoJobsDD, jobsText);

  await page.waitForSelector(mappingsLocators.scoJonasSubcontractsDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.scoJonasSubcontractsDD, jonasSubcontractText);

  await page.waitForSelector(mappingsLocators.scoResultDD, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Opens the Procore SubContracts ChangeOrders result dropdown and interactions:
 * - `optionText`          : text to check for (used for the return count / assertion)
 * - `screenshotTitle`     : base name for screenshots
 * - `populateJonasResult` : when true, also opens and populates the Jonas result DD
 * - `procoreEntryToSelect`: entry to select from the Procore dropdown to trigger Jonas
 *   population (e.g. 'CE #014'). Falls back to optionText if present.
 *
 * NOTE: Screenshot is taken AFTER dropdown interaction (not during) to prevent
 * the scroll-to-top in Screenshot.takeScreenshot from closing the open popup.
 */
export async function verifyResultDropdown(page, optionText, screenshotTitle, populateJonasResult = false, procoreEntryToSelect = null) {
  // Open the Procore SubContracts ChangeOrders dropdown
  await page.click(mappingsLocators.scoResultDD);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await page.waitForTimeout(1500);

  // Count matches for optionText while the popup is still open
  const matching = popup.filter({ hasText: optionText });
  const count = await matching.count();

  // Determine which entry to select (CE #014 takes priority over optionText)
  const selectText = procoreEntryToSelect ?? (count > 0 ? optionText : null);
  const entryToClick = selectText ? popup.filter({ hasText: selectText }) : null;
  const entryExists = entryToClick ? await entryToClick.count() : 0;

  if (entryExists > 0) {
    // Select the entry — popup closes automatically
    await entryToClick.first().click();
    await page.waitForTimeout(800);
    // Screenshot now (popup closed, scroll-to-top is safe)
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Procore_Selected`, 'Passed');

    if (populateJonasResult) {
      // Jonas result dropdown should now be populated — open and interact with it
      const jonasDD = page.locator(mappingsLocators.scoJonasResultDD);
      const jonasDDExists = await jonasDD.count();
      if (jonasDDExists > 0) {
        await jonasDD.click();
        await page.waitForTimeout(1000);
        const jonasOptions = page.locator(mappingsLocators.dropdownPopupItems);
        const jonasCount = await jonasOptions.count();
        if (jonasCount > 0) {
          await jonasOptions.first().click();
          await page.waitForTimeout(500);
        } else {
          await page.keyboard.press('Escape');
        }
        // Screenshot after Jonas interaction (popup closed)
        await Screenshot.takeScreenshot(page, `${screenshotTitle}_Jonas_Selected`, 'Passed');
      }
    }
  } else {
    // Nothing to select — close popup then screenshot the empty state
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await Screenshot.takeScreenshot(page, screenshotTitle, 'Passed');
  }
  return count;
}

/**
 * Navigate to Mappings and fill the entire PCCO mapping form in sequence.
 * PCCO has no Procore Subcontracts, Supplier, or Jonas Subcontracts fields.
 */
export async function fillPccoMappingForm(page, {
  procoreProjectText = 'LP0712',
  jonasCompanyText = 'JT',
  subledgerText = 'AP',
  jobsText = 'LP0712',
} = {}) {
  await page.click(mappingsLocators.mappingsTab);
  await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });

  await selectKendoOption(page, mappingsLocators.firstDropdown, 'Prime Contract ChangeOrder');

  await page.waitForSelector(mappingsLocators.pccoProjectDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.pccoProjectDD, procoreProjectText);

  await page.waitForSelector(mappingsLocators.pccoJonasCompanyDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.pccoJonasCompanyDD, jonasCompanyText);

  await page.waitForSelector(mappingsLocators.pccoSubledgerDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.pccoSubledgerDD, subledgerText);

  await page.waitForSelector(mappingsLocators.pccoJobsDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.pccoJobsDD, jobsText);

  await page.waitForSelector(mappingsLocators.pccoResultDD, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Opens the Procore Prime Contract Change Orders result dropdown and interacts:
 * - If `optionText` is found, selects it and screenshots with "_Selected" suffix.
 * - If not found, closes the popup and screenshots with "_Not_Found" suffix.
 * Returns the count of matching items.
 */
export async function verifyPccoResultDropdown(page, optionText, screenshotTitle) {
  await page.click(mappingsLocators.pccoResultDD);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await page.waitForTimeout(1500);

  const matching = popup.filter({ hasText: optionText });
  const count = await matching.count();

  if (count > 0) {
    await matching.first().click();
    await page.waitForTimeout(800);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Selected`, 'Passed');
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Not_Found`, 'Passed');
  }
  return count;
}

/**
 * Navigate to Mappings and fill the entire Subcontracts mapping form in sequence.
 * Subcontracts has the same upstream shape as PCCO (no Procore Subcontracts, Supplier,
 * or Jonas Subcontracts fields). The result DD shows Jonas subcontract entries when
 * Include Mapped is OFF, and splits into Procore (left) / Jonas (right) columns when ON.
 */
export async function fillSubcontractMappingForm(page, {
  procoreProjectText = 'LP0712',
  jonasCompanyText = 'JT',
  subledgerText = 'AP',
  jobsText = 'LP0712',
} = {}) {
  await page.click(mappingsLocators.mappingsTab);
  await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });

  // Open type dropdown then click the exact 'Subcontracts' option (not 'SubContracts ChangeOrder')
  await page.click(mappingsLocators.firstDropdown);
  const subOption = page.locator(mappingsLocators.subTypeOption);
  await subOption.waitFor({ state: 'visible', timeout: 15000 });
  await subOption.click();
  await page.waitForTimeout(800);

  await page.waitForSelector(mappingsLocators.subProjectDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.subProjectDD, procoreProjectText);

  await page.waitForSelector(mappingsLocators.subJonasCompanyDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.subJonasCompanyDD, jonasCompanyText);

  await page.waitForSelector(mappingsLocators.subSubledgerDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.subSubledgerDD, subledgerText);

  await page.waitForSelector(mappingsLocators.subJobsDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.subJobsDD, jobsText);

  await page.waitForSelector(mappingsLocators.subResultDD, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Opens the Subcontracts result dropdown and looks for `optionText`:
 * - Include Mapped OFF: `subResultDD` shows Jonas subcontract entries.
 * - Include Mapped ON:  `subResultDD` shows Procore entries (left column);
 *   pass `useJonasMappedDD = true` to open the Jonas entries (right column) instead.
 * Screenshots the result and returns the match count.
 */
export async function verifySubcontractResultDropdown(page, optionText, screenshotTitle, useJonasMappedDD = false) {
  const ddLocator = useJonasMappedDD ? mappingsLocators.subJonasMappedResultDD : mappingsLocators.subResultDD;
  await page.click(ddLocator);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await page.waitForTimeout(1500);

  const matching = popup.filter({ hasText: optionText });
  const count = await matching.count();

  if (count > 0) {
    await matching.first().click();
    await page.waitForTimeout(800);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Found`, 'Passed');
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Not_Found`, 'Passed');
  }
  return count;
}

/**
 * Navigate to Mappings and fill the entire Purchase Orders mapping form in sequence.
 * PO has the same upstream shape as PCCO/Subcontracts (no Procore Subcontracts, Supplier,
 * or Jonas Subcontracts fields).
 */
export async function fillPoMappingForm(page, {
  procoreProjectText = 'LP0712',
  jonasCompanyText = 'JT',
  subledgerText = 'AP',
  jobsText = 'LP0712',
} = {}) {
  await page.click(mappingsLocators.mappingsTab);
  await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });

  // Open type dropdown then click the exact 'Purchase orders' option
  await page.click(mappingsLocators.firstDropdown);
  const poOption = page.locator(mappingsLocators.poTypeOption);
  await poOption.waitFor({ state: 'visible', timeout: 15000 });
  await poOption.click();
  await page.waitForTimeout(800);

  await page.waitForSelector(mappingsLocators.poProjectDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.poProjectDD, procoreProjectText);

  await page.waitForSelector(mappingsLocators.poJonasCompanyDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.poJonasCompanyDD, jonasCompanyText);

  await page.waitForSelector(mappingsLocators.poSubledgerDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.poSubledgerDD, subledgerText);

  await page.waitForSelector(mappingsLocators.poJobsDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.poJobsDD, jobsText);

  await page.waitForSelector(mappingsLocators.poResultDD, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Opens the Purchase Orders result dropdown and looks for `optionText`:
 * - Include Mapped OFF: `poResultDD` shows unmapped Jonas PO entries.
 * - Include Mapped ON:  same `poResultDD` shows all Jonas PO entries (including mapped).
 * Screenshots the result and returns the match count.
 */
export async function verifyPoResultDropdown(page, optionText, screenshotTitle) {
  await page.click(mappingsLocators.poResultDD);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await page.waitForTimeout(1500);

  const matching = popup.filter({ hasText: optionText });
  const count = await matching.count();

  if (count > 0) {
    await matching.first().click();
    await page.waitForTimeout(800);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Found`, 'Passed');
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Not_Found`, 'Passed');
  }
  return count;
}

/**
 * Navigate to Mappings and fill the Supplier (Directory / Customers and Suppliers) mapping form.
 * The form has a radio button (Supplier) plus Jonas Company and Subledger dropdowns only
 * (no Procore Project or Jobs fields).
 */
export async function fillSupplierMappingForm(page, {
  jonasCompanyText = 'JT',
  subledgerText = 'AP',
} = {}) {
  await page.click(mappingsLocators.mappingsTab);
  await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });

  // Open type dropdown then click the Directory / Customers and Suppliers option
  await page.click(mappingsLocators.firstDropdown);
  const supplierTypeOption = page.locator(mappingsLocators.supplierTypeOption);
  await supplierTypeOption.waitFor({ state: 'visible', timeout: 15000 });
  await supplierTypeOption.click();
  // Wait for kendo popup to fully close before interacting with radio
  await page.waitForFunction(
    () => document.querySelectorAll('.k-animation-container-shown').length === 0,
    { timeout: 8000 }
  ).catch(() => {});
  await page.waitForTimeout(800);

  // Select the Supplier radio button
  const supplierRadio = page.locator(mappingsLocators.supplierRadio);
  await supplierRadio.waitFor({ state: 'visible', timeout: 10000 });
  await supplierRadio.check({ force: true });
  await page.waitForTimeout(800);

  await page.waitForSelector(mappingsLocators.supplierJonasCompanyDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.supplierJonasCompanyDD, jonasCompanyText);

  await page.waitForSelector(mappingsLocators.supplierSubledgerDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.supplierSubledgerDD, subledgerText);

  await page.waitForSelector(mappingsLocators.supplierResultDD, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Opens the Supplier result dropdown and looks for `optionText`:
 * - Include Mapped OFF: `supplierResultDD` shows unmapped Jonas supplier entries.
 * - Include Mapped ON:  `supplierResultDD` shows Procore supplier entries (left column);
 *   pass `useJonasMappedDD = true` to open the Jonas entries (right column) instead.
 * Screenshots the result and returns the match count.
 */
export async function verifySupplierResultDropdown(page, optionText, screenshotTitle, useJonasMappedDD = false) {
  const ddLocator = useJonasMappedDD ? mappingsLocators.supplierJonasMappedResultDD : mappingsLocators.supplierResultDD;
  await page.click(ddLocator);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await page.waitForTimeout(1500);

  const matching = popup.filter({ hasText: optionText });
  const count = await matching.count();

  if (count > 0) {
    await matching.first().click();
    await page.waitForTimeout(800);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Found`, 'Passed');
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Not_Found`, 'Passed');
  }
  return count;
}

/**
 * Navigate to Mappings and fill the Projects - Jobs mapping form.
 * Form: Type → Jonas Company → Procore Project → Jonas Jobs result DD.
 * Unique to this type: an "Include Inactive Jobs" checkbox (#ActiveEntryCheck)
 * in addition to the standard "Include Mapped Entries" checkbox.
 */
export async function fillJobsMappingForm(page, {
  jonasCompanyText = 'JT',
  procoreProjectText = '25-270',
} = {}) {
  await page.click(mappingsLocators.mappingsTab);
  await page.waitForSelector('kendo-dropdownlist', { timeout: 15000 });

  await page.click(mappingsLocators.firstDropdown);
  const jobsOption = page.locator(mappingsLocators.jobsTypeOption);
  await jobsOption.waitFor({ state: 'visible', timeout: 15000 });
  await jobsOption.click();
  await page.waitForTimeout(800);

  await page.waitForSelector(mappingsLocators.jobsJonasCompanyDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.jobsJonasCompanyDD, jonasCompanyText);

  await page.waitForSelector(mappingsLocators.jobsProcoreProjectDD, { timeout: 10000 });
  await selectKendoOption(page, mappingsLocators.jobsProcoreProjectDD, procoreProjectText);

  await page.waitForSelector(mappingsLocators.jobsResultDD, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Opens the Jobs result dropdown and looks for `optionText`.
 * Screenshots the result and returns the match count.
 */
export async function verifyJobsResultDropdown(page, optionText, screenshotTitle) {
  await page.click(mappingsLocators.jobsResultDD);
  const popup = page.locator(mappingsLocators.dropdownPopupItems);
  await page.waitForTimeout(1500);

  const matching = popup.filter({ hasText: optionText });
  const count = await matching.count();

  if (count > 0) {
    await matching.first().click();
    await page.waitForTimeout(800);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Found`, 'Passed');
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await Screenshot.takeScreenshot(page, `${screenshotTitle}_Not_Found`, 'Passed');
  }
  return count;
}
