export const integratorLocators = {
  // Nav
  synchronizationTab: "//a[@href='/sync']",

  // Sync page — Upload Costs section
  syncJobMultiselectInput:      "p:has-text('Select the job you wish to upload costs for.') + div kendo-multiselect .k-input-inner",
  syncRequisitionsCheckbox:     "#uploadRequisitionsCheckBox",
  syncPaymentsCheckbox:         "#uploadPaymentCheckBox",
  syncDirectCostsCheckbox:      "#uploadDirectCostCheckBox",
  // Date inputs — use .nth(0) for start date and .nth(1) for end date
  syncRequisitionsDateInputs:   "div.m-0.mt-3:has(#uploadRequisitionsCheckBox) kendo-dateinput input.k-input-inner",
  syncPaymentsDateInputs:       "div.m-0.mt-3:has(#uploadPaymentCheckBox) kendo-dateinput input.k-input-inner",
  syncDirectCostsDateInputs:    "div.m-0.mt-3:has(#uploadDirectCostCheckBox) kendo-dateinput input.k-input-inner",
  syncUploadNowButton:          "//button[normalize-space(.)='Upload Now']",
  syncUploadResponseMsg:        ".errorMessageColor",

  // Grid container — confirms the events-home grid has rendered
  eventsGrid: 'kendo-grid',

  // Column header locators (XPath — matches the k-header <th> containing the exact column title)
  colIdHeader:            "//th[contains(@class,'k-header')][.//span[normalize-space(.)='ID']]",
  colResourceIdHeader:    "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Resource Id']]",
  colReceivedAtHeader:    "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Received At']]",
  colHandledAtHeader:     "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Handled At']]",
  colMessageTypeHeader:   "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Message Type']]",
  colActionTypeHeader:    "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Action Type']]",
  colJsonPayloadHeader:   "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Json Payload']]",
  colStatusHeader:        "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Status']]",
  colStatusMessageHeader: "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Status Message']]",
  colErrorDetailsHeader:  "//th[contains(@class,'k-header')][.//span[normalize-space(.)='Error Details']]",

  // Sort indicator classes (used as fallback assertions)
  sortAscClass:  'k-i-sort-asc-small',
  sortDescClass: 'k-i-sort-desc-small',
};
