export const mappingsLocators = {
    // Nav
    mappingsTab: "//a[@href='/maps-home']",
    // Shared
    dropdownPopupItems: "kendo-popup kendo-list li.k-list-item",
    // Please select type (initial dropdown)
    firstDropdown: "(//kendo-dropdownlist)[1]",
    scoTypeOption: "kendo-popup kendo-list li.k-list-item:has-text('SubContracts ChangeOrder')",
    scoFirstMappingDropdown: "(//kendo-dropdownlist)[2]",
    // SCO full form - indices shift dynamically as dropdowns appear
    scoProjectDD: "(//kendo-dropdownlist)[2]",
    scoProSubcontractsDD: "(//kendo-dropdownlist)[3]",  // appears after project selected
    scoJonasCompanyDD: "(//kendo-dropdownlist)[4]",     // shifts after Procore Subcontracts appears
    scoSubledgerDD: "(//kendo-dropdownlist)[5]",        // appears after Jonas Company selected
    scoSupplierDD: "(//kendo-dropdownlist)[6]",         // appears after Subledger selected
    scoJobsDD: "(//kendo-dropdownlist)[7]",             // appears after Subledger selected
    scoJonasSubcontractsDD: "(//kendo-dropdownlist)[8]", // appears after Jobs selected
    scoResultDD: "(//kendo-dropdownlist)[9]",           // Procore SubContracts ChangeOrders result DD
    scoJonasResultDD: "(//kendo-dropdownlist)[10]",       // Jonas SubContracts ChangeOrders result DD (appears after Procore result selected)
    // Checkbox
    includeMappedEntriesCheckbox: "#UnmappedEntryCheck",
    // PCCO full form — no Procore Subcontracts, Supplier, or Jonas Subcontracts fields
    pccoProjectDD: "(//kendo-dropdownlist)[2]",
    pccoJonasCompanyDD: "(//kendo-dropdownlist)[3]",   // appears after type selected
    pccoSubledgerDD: "(//kendo-dropdownlist)[4]",       // appears after Jonas Company selected
    pccoJobsDD: "(//kendo-dropdownlist)[5]",            // appears after Subledger selected
    pccoResultDD: "(//kendo-dropdownlist)[6]",          // Procore Prime Contract Change Orders result DD
    pccoJonasResultDD: "(//kendo-dropdownlist)[7]",     // Jonas result DD (appears when Include Mapped checked)
    // Subcontracts full form — same upstream shape as PCCO (no Procore Subcontracts, Supplier, or Jonas Subcontracts fields)
    subTypeOption: "kendo-popup kendo-list li.k-list-item:not(:has-text('ChangeOrder')):has-text('Subcontracts')",
    subFirstMappingDropdown: "(//kendo-dropdownlist)[2]",
    subProjectDD: "(//kendo-dropdownlist)[2]",
    subJonasCompanyDD: "(//kendo-dropdownlist)[3]",     // appears after project selected
    subSubledgerDD: "(//kendo-dropdownlist)[4]",        // appears after Jonas Company selected
    subJobsDD: "(//kendo-dropdownlist)[5]",             // appears after Subledger selected
    subResultDD: "(//kendo-dropdownlist)[6]",           // result DD: Jonas entries (Include Mapped OFF) / Procore entries left column (Include Mapped ON)
    subJonasMappedResultDD: "(//kendo-dropdownlist)[7]", // Jonas entries right column (Include Mapped ON only)
    // Purchase Orders full form — same upstream shape as PCCO and Subcontracts
    poTypeOption: "kendo-popup kendo-list li.k-list-item:has-text('Purchase orders')",
    poFirstMappingDropdown: "(//kendo-dropdownlist)[2]",
    poProjectDD: "(//kendo-dropdownlist)[2]",
    poJonasCompanyDD: "(//kendo-dropdownlist)[3]",      // appears after project selected
    poSubledgerDD: "(//kendo-dropdownlist)[4]",         // appears after Jonas Company selected
    poJobsDD: "(//kendo-dropdownlist)[5]",              // appears after Subledger selected
    poResultDD: "(//kendo-dropdownlist)[6]",            // Jonas PO entry result DD (Include Mapped OFF: unmapped only; ON: all entries)
    poProcoreMappedResultDD: "(//kendo-dropdownlist)[7]", // Procore PO entries column (Include Mapped ON only)
    // Supplier (Directory / Customers and Suppliers) form
    supplierTypeOption: "kendo-popup kendo-list li.k-list-item:has-text('Directory')",
    supplierRadio: "(//input[@type='radio'][@name='list_name'])[2]",     // Supplier radio (Customer=1, Supplier=2)
    supplierJonasCompanyDD: "(//kendo-dropdownlist)[2]",                  // appears after Supplier radio selected
    supplierSubledgerDD: "(//kendo-dropdownlist)[3]",                     // appears after Jonas Company selected
    supplierResultDD: "(//kendo-dropdownlist)[4]",                        // result DD: Jonas entries (Include Mapped OFF) / Procore entries left column (Include Mapped ON)
    supplierJonasMappedResultDD: "(//kendo-dropdownlist)[5]",             // Jonas entries right column (Include Mapped ON only)
    // Projects - Jobs form
    jobsTypeOption: "kendo-popup kendo-list li.k-list-item:has-text('Projects - Jobs')",
    jobsFirstMappingDropdown: "(//kendo-dropdownlist)[2]",               // Jonas Company DD (first dropdown after type)
    jobsJonasCompanyDD: "(//kendo-dropdownlist)[2]",                     // appears after type selected
    jobsProcoreProjectDD: "(//kendo-dropdownlist)[3]",                   // Procore Project selection (appears after Jonas Company)
    jobsResultDD: "(//kendo-dropdownlist)[4]",                           // Jonas Jobs result DD
    includeInactiveJobsCheckbox: "#ActiveEntryCheck",                    // Include Inactive Jobs checkbox (unique to Projects - Jobs)
};
