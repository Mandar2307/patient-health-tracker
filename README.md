# LWC Reusable Component Library
### Built by Mandar Rahate — Salesforce Certified Developer

A collection of **6 production-ready Lightning Web Components** built for reusability across Salesforce Sales Cloud, Service Cloud, and custom app implementations.

---

## Components

| # | Component | What It Does | Skills |
|---|-----------|-------------|--------|
| 1 | `customToast` | Success/Error/Warning notification alerts | @api, CustomEvent, CSS animation |
| 2 | `searchBar` | Live search with 300ms debounce | Debounce, Imperative Apex, Governor limits |
| 3 | `sortableTable` | Click-to-sort table with pagination | @api, Array.sort, Getter logic |
| 4 | `recordPicker` | Custom lookup/search for any object | CustomEvent, SOSL, Dropdown UI |
| 5 | `progressBar` | Multi-step progress indicator | @api, Computed getter, Conditional CSS |
| 6 | `confirmModal` | Reusable confirmation dialog | @api, CustomEvent, Accessibility |

---

## How to Deploy to Your Salesforce Org

### Prerequisites
- Salesforce CLI installed
- Connected to a Developer Org or Sandbox

### Steps
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/lwc-component-library.git
cd lwc-component-library

# Authenticate to your org
sf org login web --alias myOrg

# Deploy all components
sf project deploy start --target-org myOrg
```

---

## Component Usage Examples

### 1. Custom Toast
```html
<!-- In parent HTML -->
<c-custom-toast></c-custom-toast>
<lightning-button label="Save" onclick={handleSave}></lightning-button>
```
```javascript
// In parent JS
handleSave() {
    this.template.querySelector('c-custom-toast').show('Record saved!', 'success');
}
```

### 2. Search Bar with Debounce
```html
<c-search-bar onsearch={handleSearch}></c-search-bar>
```

### 3. Sortable Table
```html
<c-sortable-table data={accountList} columns={columns}></c-sortable-table>
```

### 4. Record Picker
```html
<c-record-picker
    object-api-name="Account"
    label="Select Account"
    onrecordselect={handleAccountSelect}>
</c-record-picker>
```

### 5. Progress Bar
```html
<c-progress-bar
    current-step={currentStep}
    steps={stepLabels}
    onstepchange={handleStepChange}>
</c-progress-bar>
```

### 6. Confirm Modal
```html
<c-confirm-modal
    title="Delete Record?"
    message="This cannot be undone."
    confirm-label="Delete"
    is-open={showModal}
    onconfirm={handleConfirm}
    oncancel={handleCancel}>
</c-confirm-modal>
```

---

## About the Developer

**Mandar Rahate** — Salesforce Certified Platform Developer  
4+ years | Sales Cloud | Service Cloud | FSL | LWC | REST API  

- Portfolio: https://mandar2307.github.io  
- LinkedIn: https://linkedin.com/in/mandarrahate  
- Trailhead: https://trailhead.salesforce.com/trailblazer/mrahate1  

**Certifications:** Platform Developer I | Data Cloud Consultant | AI Associate  
**Trailhead:** Double Star Ranger — 103,275 Points | 15X Super Badges
