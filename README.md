# Patient Health Tracker — Salesforce Health App
### Built by Mandar Rahate — Salesforce Certified Developer

A complete **Healthcare Patient Management** application built on Salesforce Lightning Platform.
Manages patient registration, appointment scheduling, treatment tracking, medicine records,
automated email reminders, and a Visualforce PDF patient health report.

---

## Features

| Feature | Technology Used |
|---------|----------------|
| Patient Registration | Custom Object, LWC Form, Validation Rules |
| Appointment Booking | Custom Object, LWC, Flows |
| Treatment & Medicine Tracking | Custom Objects, Related Lists, LWC |
| Automated Email Reminders | Schedulable Apex, Email Services |
| Patient Health PDF Report | Visualforce Page, Apex Controller |
| Operations Dashboard | LWC, @wire, Chart.js, Apex |
| Data Model | 4 Custom Objects with Lookup Relationships |

---

## Data Model

```
Patient__c
    ├── Appointment__c   (Lookup → Patient__c)
    └── Treatment__c     (Lookup → Patient__c)
            └── Medicine__c  (Lookup → Treatment__c)
```

---

## Custom Objects — Full Field Reference

> ⚠️ Create objects in this exact order: Patient → Appointment → Treatment → Medicine
> Each object has a lookup to the previous one.

---

### 1. Patient__c
**Label:** Patient | **Plural Label:** Patients | **API Name:** Patient__c

| Field Label | API Name | Data Type | Required | Notes |
|-------------|----------|-----------|----------|-------|
| Patient Name | `Name` | Text (Auto Name) | ✅ Yes | Standard field — set as Text |
| Date of Birth | `Date_of_Birth__c` | Date | No | — |
| Gender | `Gender__c` | Picklist | ✅ Yes | Values: Male, Female, Other |
| Phone | `Phone__c` | Phone | No | — |
| Email | `Email__c` | Email | No | Used by reminder scheduler — important |
| Blood Group | `Blood_Group__c` | Picklist | No | Values: A+, A-, B+, B-, O+, O-, AB+, AB- |
| Address | `Address__c` | Text Area (255) | No | — |
| Status | `Status__c` | Picklist | ✅ Yes | Values: Active, Inactive, Discharged — Default: Active |

---

### 2. Appointment__c
**Label:** Appointment | **Plural Label:** Appointments | **API Name:** Appointment__c

| Field Label | API Name | Data Type | Required | Notes |
|-------------|----------|-----------|----------|-------|
| Appointment Number | `Name` | Auto Number | ✅ Yes | Format: APT-{0000} |
| Patient | `Patient__c` | Lookup (Patient__c) | ✅ Yes | Links appointment to patient |
| Appointment Date | `Appointment_Date__c` | DateTime | ✅ Yes | Used by reminder scheduler |
| Doctor Name | `Doctor_Name__c` | Text (100) | ✅ Yes | — |
| Department | `Department__c` | Picklist | ✅ Yes | Values: General, Cardiology, Neurology, Ortho, Pediatrics |
| Status | `Status__c` | Picklist | ✅ Yes | Values: Scheduled, Completed, Cancelled — Default: Scheduled |
| Notes | `Notes__c` | Text Area (500) | No | — |

---

### 3. Treatment__c
**Label:** Treatment | **Plural Label:** Treatments | **API Name:** Treatment__c

| Field Label | API Name | Data Type | Required | Notes |
|-------------|----------|-----------|----------|-------|
| Treatment Number | `Name` | Auto Number | ✅ Yes | Format: TRT-{0000} |
| Patient | `Patient__c` | Lookup (Patient__c) | ✅ Yes | Links treatment to patient |
| Treatment Name | `Treatment_Name__c` | Text (100) | ✅ Yes | — |
| Start Date | `Start_Date__c` | Date | ✅ Yes | — |
| End Date | `End_Date__c` | Date | No | Leave blank if ongoing |
| Doctor | `Doctor__c` | Text (100) | ✅ Yes | — |
| Status | `Status__c` | Picklist | ✅ Yes | Values: Ongoing, Completed, On Hold — Default: Ongoing |
| Notes | `Notes__c` | Text Area (500) | No | — |

---

### 4. Medicine__c
**Label:** Medicine | **Plural Label:** Medicines | **API Name:** Medicine__c

| Field Label | API Name | Data Type | Required | Notes |
|-------------|----------|-----------|----------|-------|
| Medicine Number | `Name` | Auto Number | ✅ Yes | Format: MED-{0000} |
| Treatment | `Treatment__c` | Lookup (Treatment__c) | ✅ Yes | ⚠️ Set Child Relationship Name = **Medicines** |
| Medicine Name | `Medicine_Name__c` | Text (100) | ✅ Yes | — |
| Dosage | `Dosage__c` | Text (50) | ✅ Yes | e.g. 500mg, 10ml |
| Frequency | `Frequency__c` | Picklist | ✅ Yes | Values: Once daily, Twice daily, Thrice daily, Weekly |
| Start Date | `Start_Date__c` | Date | No | — |
| End Date | `End_Date__c` | Date | No | — |
| Instructions | `Instructions__c` | Text Area (255) | No | e.g. Take after food |

> ⚠️ **Critical:** When creating the Medicine__c Lookup to Treatment__c,
> set the **Child Relationship Name** field to exactly `Medicines`
> (Salesforce adds `__r` automatically → becomes `Medicines__r`).
> The Apex subquery `treat.Medicines__r` depends on this exact name.

---

## Standard Objects Used

These already exist in every Salesforce org — no setup needed.

| Object | API Name | Fields Used | Purpose |
|--------|----------|-------------|---------|
| User | `User` | `Id`, `Name`, `Email`, `IsActive` | Record ownership, email reminders via Messaging API |

---

## Metadata & Configuration

### Schedulable Apex — PatientReminderScheduler
- **What it does:** Runs every day at 8 AM, finds all appointments scheduled for tomorrow, sends HTML email reminders to patients who have a valid email address.
- **How to schedule:** Open Developer Console → Execute Anonymous → run:

```apex
System.schedule('Daily Patient Reminders', '0 0 8 * * ?', new PatientReminderScheduler());
```

- **Cron Expression:** `0 0 8 * * ?` = every day at 8:00 AM

---

### Visualforce Page — PatientHealthReport
- **What it does:** Renders a full patient health summary as a downloadable PDF — includes patient info, appointment history, all treatments, and current medicines.
- **URL format:** `/apex/PatientHealthReport?id={Patient_Record_Id}`
- **Controller:** `PatientReportController.cls`
- **renderAs:** `pdf` — automatically serves as a PDF

---

### Lightning App Page
- **What it does:** Main app page hosting the `patientDashboard` LWC with stats, patient table, and department chart.
- **How to create:**
  1. Setup → App Manager → New Lightning App
  2. Name: Patient Health Tracker
  3. Add `patientDashboard` component via App Builder
  4. Save and Activate

---

### Lightning Record Page — Patient__c
- **What it does:** Individual patient record page showing `appointmentBooking` and `treatmentTracker` LWC components.
- **How to create:**
  1. Open any Patient record → gear icon → Edit Page
  2. Drag `appointmentBooking` to left column
  3. Drag `treatmentTracker` to right column
  4. Save → Activate → Activate for org

---

## Components Overview

### LWC Components

| Component | API Name | What It Does |
|-----------|----------|-------------|
| Patient Dashboard | `patientDashboard` | Stats cards, searchable patient table, appointments-by-department bar chart |
| Patient Registration | `patientRegistration` | Full patient registration form with validation, fires event on save |
| Appointment Booking | `appointmentBooking` | Book appointments and view history per patient, uses refreshApex |
| Treatment Tracker | `treatmentTracker` | Add treatments and medicines per treatment on one screen |

### Apex Classes

| Class | Type | What It Does |
|-------|------|-------------|
| `PatientController` | @AuraEnabled | All methods for LWC — stats, patient CRUD, appointments, treatments, medicines |
| `PatientReminderScheduler` | Schedulable | Daily email reminders for tomorrow's appointments |
| `PatientReportController` | VF Controller | Fetches patient + related data for Visualforce PDF report |

### Visualforce Pages

| Page | What It Does |
|------|-------------|
| `PatientHealthReport` | PDF report — patient info, appointments table, treatments and medicines |

---

## How to Deploy

### Prerequisites
- Free Salesforce Developer Org — sign up at developer.salesforce.com/signup
- Salesforce CLI installed — developer.salesforce.com/tools/salesforcecli

### Step 1 — Create all 4 custom objects in Salesforce Setup
Follow the field reference table above. Create in order: Patient → Appointment → Treatment → Medicine.

### Step 2 — Clone and deploy

```bash
git clone https://github.com/Mandar2307/patient-health-tracker.git
cd patient-health-tracker
sf org login web --alias healthOrg
sf project deploy start --target-org healthOrg
```

### Step 3 — Schedule email reminders
Open Developer Console → Execute Anonymous:

```apex
System.schedule('Daily Patient Reminders', '0 0 8 * * ?', new PatientReminderScheduler());
```

### Step 4 — Set up Lightning Pages
- Create App Page → add `patientDashboard` component
- Edit Patient__c record page → add `appointmentBooking` + `treatmentTracker`

---

## Component Usage

```html
<!-- App Page -->
<c-patient-dashboard></c-patient-dashboard>

<!-- Patient Record Page -->
<c-appointment-booking patient-id={recordId}></c-appointment-booking>
<c-treatment-tracker patient-id={recordId}></c-treatment-tracker>

<!-- Called from Dashboard -->
<c-patient-registration
    onpatientsaved={handlePatientSaved}
    oncancel={handleCancel}>
</c-patient-registration>
```

PDF Report URL:
```
/apex/PatientHealthReport?id=PATIENT_RECORD_ID
```

---

## Real Project Connection

This project is inspired by real work done on the **Praxis Healthcare Phase 2** Salesforce
Lightning implementation, where a Visualforce patient report was built consolidating
treatment status, prescribed medicines, and care details for **500+ active patient records**,
eliminating manual clinical lookups for healthcare staff.

---

## About the Developer

**Mandar Rahate** — Salesforce Certified Platform Developer
4+ years | Sales Cloud | Service Cloud | FSL | Healthcare | LWC | REST API

- Portfolio: https://mandar2307.github.io
- LinkedIn: https://linkedin.com/in/mandarrahate
- Trailhead: https://trailhead.salesforce.com/trailblazer/mrahate1

**Certifications:** Platform Developer I · Data Cloud Consultant · AI Associate
**Trailhead:** Double Star Ranger — 103,275 Points | 15X Super Badges
