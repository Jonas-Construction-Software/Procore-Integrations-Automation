export const integratorLocators = {
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

  // Synchronization page
  syncTab:                "//a[@href='/sync']",
  // .col-md-4.col-sm-12 is the unique container div for the job multiselect
  syncJobMultiselect:     ".col-md-4.col-sm-12 kendo-multiselect",
  syncJobMultiselectInput:".col-md-4.col-sm-12 kendo-multiselect input",
  syncUploadNowButton:    "//button[normalize-space(.)='Upload Now']",
};
