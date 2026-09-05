# AGENTS.md

# College Admission & Fee Management System

## 1. Project Overview

This project is a simple, professional, and responsive **College Admission & Fee Management System**.

The primary purpose of the system is to allow college/admin staff to:

* Enroll students.
* Store student admission information.
* Record total fee and payments.
* Automatically calculate remaining dues.
* Record payment due dates.
* Generate professional fee slips.
* Download or print fee slips.
* Share fee slips through WhatsApp.
* Search students by name.
* Filter students by admission type and program/group.
* View complete student information.
* Track the student's enrollment/examination progress using a simple 4-step progress tracker.

This is an MVP/sample system. Do not add unnecessary school-management features unless explicitly requested.

---

# 2. Core Product Philosophy

The application must be:

* Simple
* Professional
* Fast
* Easy for non-technical college staff to use
* Responsive on desktop, tablet, and mobile
* Clean and uncluttered
* Easy to maintain
* Easy to extend later

Do not over-engineer the application.

Every feature must have a clear purpose.

Prefer a simple solution over a complicated solution when both achieve the same result.

---

# 3. Technology Stack

## Frontend

Use:

* ReactJS
* Vite
* JavaScript or TypeScript according to the existing project setup
* Tailwind CSS
* React Router for navigation where needed

## Backend / Database

Use:

* Supabase
* Supabase PostgreSQL database
* Supabase Authentication when authentication is implemented
* Supabase Storage only when file/document storage is required

The frontend communicates with Supabase through the official Supabase client.

Do not introduce another backend/database unless explicitly requested.

---

# 4. Development Philosophy — Vibe Coding

This project will be developed using AI-assisted/vibe coding.

AI agents must follow these rules:

## 4.1 Inspect Before Changing

Before modifying existing code:

1. Inspect the project structure.
2. Inspect relevant files.
3. Understand existing components.
4. Understand the existing database structure.
5. Reuse existing components and utilities where possible.
6. Do not rewrite working code unnecessarily.

Never blindly replace an existing implementation.

---

## 4.2 One Section at a Time

Build the application incrementally.

Do not attempt to build the entire application in one step.

Recommended workflow:

1. Inspect
2. Plan
3. Implement one section
4. Test
5. Review
6. Fix
7. Move to the next section

---

## 4.3 Do Not Make Major Decisions Silently

If a requirement is unclear and the decision affects:

* Database structure
* User workflow
* Financial calculations
* Authentication
* Permissions
* Major UI structure
* Data relationships

Ask before making the decision.

For small implementation details, use sensible professional defaults.

---

## 4.4 Do Not Invent Requirements

Only implement requirements that are:

* Explicitly requested
* Clearly implied by the approved workflow
* Necessary for the requested feature to function correctly

Do not add random modules such as:

* Attendance
* Payroll
* Teacher management
* Library management
* Inventory
* SMS system
* Hostel management
* Transport management

unless explicitly requested later.

---

# 5. Application Structure

The main application should contain these areas:

```text
Application
│
├── Dashboard
│
├── Students
│   ├── Student List
│   ├── Search
│   ├── Filters
│   └── Student Profile
│
├── Enroll Student
│
└── Student Profile
    ├── Student Information
    ├── Fee Summary
    ├── Payment History
    ├── Fee Slip
    └── Progress Tracker
```

Additional pages/features may be introduced later when required.

---

# 6. Main User Workflow

The primary workflow is:

```text
                ENROLL STUDENT
                       │
                       ▼
             Enter Student Details
                       │
                       ▼
             Enter Admission Details
                       │
                       ▼
                 Enter Total Fee
                       │
                       ▼
               Enter Initial Payment
                       │
                       ▼
              System Calculates Dues
                       │
                       ▼
              Add Due Date if Required
                       │
                       ▼
                 Save Student
                       │
                       ▼
              Student Profile Created
                       │
                       ▼
              Generate Fee Slip
                       │
              ┌────────┴────────┐
              ▼                 ▼
        Download / Print      WhatsApp
                       │
                       ▼
               Continue Progress
                       │
                       ▼
          Enrollment in Verification
                       │
                       ▼
          Enrollment Card Issued
                       │
                       ▼
        Examination in Verification
                       │
                       ▼
              Admit Card Issued
```

---

# 7. Student Enrollment Form

The enrollment form must contain the following fields.

## Student Information

```text
Student Name
Father Name
Date of Birth
Student CNIC
Father CNIC
Gender
Contact Number
Reference
```

## Admission Information

```text
Admission Session
Admission Type
Program/Group
Academic Class
```

## Fee Information

```text
Total Fee
Paid
Dues
Due Date
```

---

# 8. Admission Session

Admission Session must be a dropdown.

Options:

```text
Annual I
Annual II
```

Do not allow arbitrary text for the session in the normal enrollment form.

---

# 9. Admission Type

Admission Type must be a dropdown.

Options:

```text
Regular
Private
Combine (Gap)
```

The Program/Group dropdown must change based on the selected Admission Type.

---

# 10. Program/Group Rules

## Private

If Admission Type = `Private`, show:

```text
Private Computer Science
Private Science
Commerce Private
General Private
Humanities Private
```

## Regular

If Admission Type = `Regular`, show:

```text
Commerce Regular
Computer Science
General Regular
General Science Regular
Humanities Regular
Pre Engineering Regular
Pre Medical Regular
Science Regular
```

## Combine (Gap)

If Admission Type = `Combine (Gap)`, show:

```text
Commerce Private
Computer Science Private
General Private
General Science Private
Humanities Private
Pre Engineering Private
Pre Medical Private
Science Private
```

The application must never show irrelevant Program/Group options for the selected Admission Type.

---

# 11. Program/Group Must Be Configurable

Do not permanently hard-code the complete admission/program configuration inside React components.

The long-term design should allow an Admin to configure:

* Admission Type
* Program/Group
* Academic Class
* Active/inactive status

For the MVP, the approved initial configuration may be seeded into Supabase.

Future changes should be possible from an Admin configuration area without modifying React source code.

---

# 12. Academic Class Rules

For `Regular` and `Private`:

```text
IX
X
XI
XII
```

For `Combine (Gap)`:

```text
IX, X Combine
XI, XII Combine
```

The Academic Class dropdown must respond automatically to the selected Admission Type.

Example:

```text
Admission Type = Regular
Class = IX / X / XI / XII
```

```text
Admission Type = Combine (Gap)
Class = IX, X Combine / XI, XII Combine
```

---

# 13. Fee Management

The fee system must be simple and reliable.

Required fields:

```text
Total Fee
Paid
Dues
Due Date
```

## Automatic Dues Calculation

Dues must never be manually entered.

Formula:

```text
Dues = Total Fee - Total Paid
```

Example:

```text
Total Fee = 45,000
Paid = 10,000

Dues = 45,000 - 10,000
Dues = 35,000
```

The Dues field must be read-only in the UI.

---

# 14. Payment History

Do not treat `Paid` as a manually editable lifetime value only.

Every payment should be stored as an individual transaction.

Example:

```text
Student: Ahmed Khan

Payment History

05-Sep-2026    Rs.10,000
15-Sep-2026    Rs.15,000
20-Sep-2026    Rs.20,000
```

Total Paid should be calculated from payment records.

```text
Total Paid = Sum of all successful payments
```

Then:

```text
Dues = Total Fee - Total Paid
```

This creates a reliable financial history.

---

# 15. Payment Record

Each payment should contain at minimum:

```text
Payment ID
Student ID
Amount
Payment Date
Payment Method
Created At
```

Payment method can initially support:

```text
Cash
Bank
Other
```

Do not add unnecessary payment methods unless required.

---

# 16. Due Date

If a student still owes money, the system should allow staff to enter:

```text
Next Payment Due Date
```

Example:

```text
Total Fee: 45,000
Paid: 10,000
Dues: 35,000
Due Date: 20-Sep-2026
```

If the student has no outstanding dues, the dashboard should show:

```text
Paid in Full
```

rather than displaying an unnecessary due date.

---

# 17. Fee Status

Fee status must be calculated automatically.

## Unpaid

```text
Total Paid = 0
Dues > 0
```

Display:

```text
UNPAID
```

## Partial / Due

```text
Total Paid > 0
Dues > 0
```

Display:

```text
DUE
```

## Paid in Full

```text
Dues = 0
```

Display:

```text
PAID IN FULL
```

## Overdue

If:

```text
Dues > 0
AND
Due Date has passed
```

display:

```text
OVERDUE
```

Do not rely on staff manually selecting these statuses.

---

# 18. Progress Tracker

The progress tracker contains ONLY these four steps.

Do not add Admission Card Delivered or Enrollment Card Filled to this tracker.

## Four Official Steps

```text
1. Enrollment in Verification
2. Enrollment Card Issued
3. Examination in Verification
4. Admit Card Issued
```

The visual flow:

```text
Enrollment in Verification
          ↓
Enrollment Card Issued
          ↓
Examination in Verification
          ↓
Admit Card Issued
```

---

# 19. Progress Tracker UI

Use a clean visual stepper.

Example:

```text
✓ ───────── ✓ ───────── ● ───────── ○

Enrollment   Enrollment   Examination   Admit
Verification Card Issued  Verification  Card Issued
```

Meaning:

```text
✓ = Completed
● = Current / In Progress
○ = Pending
```

The current step should be immediately understandable.

---

# 20. Progress State Rules

Each progress step should have its own state.

Recommended structure:

```text
enrollmentVerification
enrollmentCardIssued
examinationVerification
admitCardIssued
```

Do not store only one generic status such as:

```text
status = "Examination"
```

Individual states provide better control and future scalability.

Where useful, store completion dates.

Example:

```text
enrollmentCardIssued:
    completed: true
    date: 2026-09-10
```

---

# 21. Dashboard

The dashboard must focus on the information staff actually needs.

Do not overload the dashboard with unnecessary statistics.

## Search

The user must be able to search students by:

```text
Student Name
```

The search should be fast and easy to access.

Future search fields may include:

```text
CNIC
Father Name
Contact Number
```

but these are optional unless explicitly implemented.

---

# 22. Dashboard Filters

The dashboard/student list must allow filtering by:

```text
Admission Type
Program/Group
```

Recommended quick filters:

```text
All Students
Paid
Due
Overdue
```

Progress filters may be added when useful:

```text
Enrollment Verification
Enrollment Card Issued
Examination Verification
Admit Card Issued
```

Do not add excessive filters.

---

# 23. Student List

Recommended table:

```text
Student
Admission Type
Program/Group
Class
Total Fee
Paid
Dues
Due Date
Progress
Action
```

Example:

```text
Ahmed Khan
Combine (Gap)
Pre Medical Private
XI, XII Combine

Total:    Rs.45,000
Paid:     Rs.25,000
Dues:     Rs.20,000
Due:      20-Sep-2026

Progress:
Enrollment Card Issued
```

---

# 24. Student Profile

Clicking a student should open a complete profile.

Recommended structure:

```text
Student Profile

────────────────────────────────

Student Information

Name
Father Name
DOB
Student CNIC
Father CNIC
Gender
Contact
Reference

────────────────────────────────

Admission Information

Session
Admission Type
Program/Group
Academic Class

────────────────────────────────

Fee Summary

Total Fee
Total Paid
Dues
Due Date
Fee Status

────────────────────────────────

Payment History

Payment Date
Amount
Method
Receipt

────────────────────────────────

Progress Tracker

1. Enrollment in Verification
2. Enrollment Card Issued
3. Examination in Verification
4. Admit Card Issued

────────────────────────────────

Actions

Add Payment
Generate Fee Slip
Download / Print
WhatsApp
```

---

# 25. Fee Slip

The system must support:

```text
Generate Fee Slip
```

The fee slip should be professional, clean, and printable.

It should contain:

```text
College Name
Fee Payment Slip

Receipt Number
Payment Date

Student Name
Father Name
Contact Number

Admission Session
Admission Type
Program/Group
Academic Class

Total Fee
Previous Paid
Paid Today
Total Paid
Remaining Dues

Due Date
Payment Status

Thank You / College Contact
```

---

# 26. Fee Slip Status

If dues remain:

```text
PAYMENT DUE

Remaining:
Rs.35,000

Due Date:
20-Sep-2026
```

If all fees are paid:

```text
PAID IN FULL

Remaining:
Rs.0
```

This must be generated automatically based on payment data.

---

# 27. Fee Slip Workflow

The official workflow is:

```text
Generate Fee Slip
        ↓
Download / Print
        ↓
WhatsApp
```

Do not build a complicated document-management workflow for V1.

---

# 28. WhatsApp

The application should provide a WhatsApp action after generating the fee slip.

Recommended V1 workflow:

```text
Generate Fee Slip
        ↓
Download / Print
        ↓
Open WhatsApp
        ↓
Send Fee Slip to Student
```

The initial version does NOT require a complex WhatsApp Business API integration.

The system should prepare the relevant message and allow the staff member to send/share the generated slip.

Future versions may integrate official WhatsApp APIs if required.

---

# 29. WhatsApp Message

A simple message should communicate:

```text
Student Name
Payment Received
Total Fee
Total Paid
Remaining Dues
Due Date OR Paid in Full
```

Example:

```text
Dear Ahmed Khan,

Your fee payment of Rs.10,000 has been received.

Total Fee: Rs.45,000
Total Paid: Rs.10,000
Remaining Dues: Rs.35,000
Due Date: 20-Sep-2026

Thank you.
College Name
```

If fully paid:

```text
Dear Ahmed Khan,

Your fee payment has been received successfully.

Total Fee: Rs.45,000
Total Paid: Rs.45,000
Remaining Dues: Rs.0

Status: PAID IN FULL

Thank you.
College Name
```

Keep messages short and professional.

---

# 30. Database Architecture

Use Supabase PostgreSQL.

Recommended primary entities:

```text
students
payments
admission_types
program_groups
academic_classes
```

Progress information may initially be stored in the student record, but use a clean structure that can be expanded later.

---

# 31. Recommended Student Database Structure

A student should contain information similar to:

```text
students

id
student_name
father_name
date_of_birth
student_cnic
father_cnic
gender
contact_number
reference

admission_session
admission_type_id
program_group_id
academic_class_id

total_fee

next_payment_due_date

enrollment_verification
enrollment_card_issued
examination_verification
admit_card_issued

created_at
updated_at
```

Use foreign keys for configurable admission data where appropriate.

Do not duplicate configuration unnecessarily.

---

# 32. Recommended Payment Database Structure

```text
payments

id
student_id
amount
payment_date
payment_method
created_at
```

Relationship:

```text
students
   │
   ├── payment
   ├── payment
   └── payment
```

One student can have many payments.

---

# 33. Financial Data Rules

Never trust calculated financial values from the frontend.

The frontend can display:

```text
Dues = Total Fee - Total Paid
```

but the application architecture must treat payment records as the source of truth.

Avoid manually storing conflicting values such as:

```text
total_paid = 20,000
payments = 10,000 + 15,000
```

because this creates inconsistent financial data.

Prefer calculating totals from payment transactions.

---

# 34. Data Validation

Validate all important fields.

Examples:

### Student Name

Required.

### Father Name

Required.

### Admission Session

Required.

### Admission Type

Required.

### Program/Group

Required.

### Academic Class

Required.

### Total Fee

Must be a valid non-negative number.

### Payment

Must be a valid non-negative number.

### Dues

Automatically calculated.

### CNIC

Validate the expected format when the format is finalized.

### Contact Number

Validate the expected phone format when the format is finalized.

Do not silently accept invalid financial values.

---

# 35. Prevent Negative Dues

The system must prevent:

```text
Paid > Total Fee
```

unless overpayment is explicitly supported later.

For V1:

```text
Paid cannot exceed Total Fee.
```

If the user attempts it, show a clear validation message.

---

# 36. UI/UX Principles

Use a professional administrative interface.

Prioritize:

* Clear hierarchy
* Readable typography
* Consistent spacing
* Clear labels
* Simple forms
* Useful empty states
* Clear success/error messages
* Responsive layout
* Accessible buttons
* Clear loading states
* Clear confirmation states

Avoid:

* Excessive animations
* Huge cards
* Too many colors
* Decorative UI without purpose
* Complex dashboards
* Unnecessary popups
* Crowded tables

---

# 37. Color/Status Principles

Use semantic visual indicators.

For example:

```text
Green  = Completed / Paid
Yellow = Pending / Partial
Red    = Due / Overdue
Gray   = Not Started
```

Do not use color alone to communicate important information.

Always include text such as:

```text
PAID
DUE
OVERDUE
PENDING
COMPLETED
```

---

# 38. Responsive Design

The system must work well on:

```text
Desktop
Laptop
Tablet
Mobile
```

The primary office workflow may be desktop-first, but mobile responsiveness is required.

Tables should transform appropriately on small screens.

Do not allow important information to become inaccessible on mobile.

---

# 39. Component Architecture

Prefer reusable components.

Example:

```text
src/
├── components/
│   ├── ui/
│   ├── students/
│   ├── payments/
│   ├── progress/
│   └── fee-slip/
│
├── pages/
│   ├── Dashboard
│   ├── Students
│   ├── EnrollStudent
│   └── StudentProfile
│
├── services/
│   └── supabase/
│
├── hooks/
│
├── utils/
│
└── lib/
```

Follow the actual project structure if it already exists.

Do not reorganize the entire project without a reason.

---

# 40. Supabase Rules

Use the official Supabase client.

Keep database access organized.

Avoid scattering raw database queries throughout random UI components.

Prefer:

```text
UI
 ↓
Service / Hook
 ↓
Supabase
```

rather than:

```text
Every component
 ↓
Random Supabase queries
```

---

# 41. Security

Never expose secret server-side keys in the React frontend.

Use Supabase's appropriate public client configuration for frontend access.

Implement Row Level Security (RLS) before treating the system as production-ready.

Do not assume that hiding a button provides security.

Database permissions must enforce access.

---

# 42. Authentication

Authentication is not required for the first UI prototype unless requested.

When authentication is implemented, use Supabase Authentication.

Potential future roles:

```text
Admin
Staff
```

Permissions should be introduced only when required.

---

# 43. Error Handling

Every database operation must handle:

```text
Loading
Success
Error
Empty
```

Examples:

```text
Saving student...
Student saved successfully.
Unable to save student. Please try again.
```

Never silently fail.

---

# 44. Confirmation

For destructive actions such as deleting a student or payment:

* Require confirmation.
* Clearly explain what will happen.
* Do not delete financial records accidentally.

Financial data deletion should be treated as a sensitive operation.

---

# 45. Editing Payments

Payment history should be protected from accidental editing.

If editing/deleting payments is implemented later:

* Require confirmation.
* Record the change where appropriate.
* Recalculate totals automatically.

Never manually change the student's total paid amount without updating the underlying payment records.

---

# 46. Testing Requirements

After implementing each feature, test:

### Student Enrollment

* Can create a student.
* Required fields work.
* Admission Type works.
* Program/Group changes correctly.
* Class changes correctly.

### Fees

* Total Fee works.
* Initial Payment works.
* Dues calculate correctly.
* Full payment shows Paid in Full.
* Partial payment shows Due.
* Invalid payment is rejected.

### Search

* Search by student name.
* Search returns correct students.
* Empty search behaves correctly.

### Filters

* Admission Type filter.
* Program/Group filter.
* Fee status filters.

### Progress

* Each of the four steps works.
* Current step displays correctly.
* Completed steps display correctly.
* Pending steps display correctly.

### Fee Slip

* Correct student information.
* Correct payment information.
* Correct remaining amount.
* Correct due date.
* Correct Paid in Full status.
* Download/print works.
* WhatsApp workflow works.

---

# 47. Development Milestones

Build the project incrementally.

## Milestone 1 — Project Foundation

* React + Vite
* Tailwind CSS
* Basic layout
* Routing
* Supabase connection
* Basic project structure

Do not build the complete application yet.

---

## Milestone 2 — Dashboard UI

Create:

* Header
* Sidebar/navigation if required
* Search
* Filters
* Student table
* Fee summary
* Progress display

Use mock data initially if necessary.

---

## Milestone 3 — Enrollment Form

Implement:

* Student fields
* Admission Session
* Admission Type
* Program/Group
* Academic Class
* Fee fields
* Due Date

Implement dependent dropdown behavior.

---

## Milestone 4 — Supabase Student Database

Create:

* Students table
* Admission configuration
* Program/group configuration
* Class configuration

Connect the enrollment form to Supabase.

---

## Milestone 5 — Student List

Implement:

* Fetch students
* Search by name
* Filter by Admission Type
* Filter by Program/Group
* Fee status display
* Progress display

---

## Milestone 6 — Payment System

Implement:

* Add Payment
* Payment history
* Total Paid calculation
* Automatic Dues
* Due Date
* Paid/Due/Overdue status

---

## Milestone 7 — Student Profile

Implement:

* Complete student information
* Admission information
* Fee summary
* Payment history
* Progress tracker

---

## Milestone 8 — Progress Tracker

Implement exactly:

```text
Enrollment in Verification
Enrollment Card Issued
Examination in Verification
Admit Card Issued
```

---

## Milestone 9 — Fee Slip

Implement:

* Generate Fee Slip
* Professional printable layout
* Payment information
* Due/Paid in Full status
* Receipt number

---

## Milestone 10 — Download / Print / WhatsApp

Implement:

```text
Generate Fee Slip
      ↓
Download / Print
      ↓
WhatsApp
```

---

## Milestone 11 — UI/UX Refinement

Improve:

* Responsive design
* Loading states
* Empty states
* Error handling
* Form validation
* Accessibility
* Visual consistency

---

## Milestone 12 — Security & Production Preparation

Implement:

* Supabase Authentication
* RLS
* Role-based permissions if required
* Database indexes
* Security review
* Production environment variables
* Final testing

---

# 48. Important MVP Boundaries

The following are NOT part of the initial MVP unless explicitly requested:

```text
Attendance
Teacher Management
Payroll
Library
Transport
Hostel
SMS
Automated WhatsApp API
Advanced Accounting
Inventory
Parent Portal
Student Portal
Online Student Registration
Complex Reporting
```

Do not build these proactively.

---

# 49. Future Possibilities

The architecture should remain extendable for:

```text
Multiple colleges
Multiple sessions
Multiple staff users
Admin dashboard
Advanced reports
Fee receipts
Fee reminders
WhatsApp Business API
Document uploads
Enrollment documents
Examination documents
Role-based permissions
Audit logs
```

But these should not complicate the MVP.

---

# 50. Golden Rules for AI Coding Agents

Always follow these rules:

1. **Inspect before coding.**
2. **Do not overwrite working code unnecessarily.**
3. **Build one milestone/section at a time.**
4. **Do not invent requirements.**
5. **Do not silently make major architectural decisions.**
6. **Keep the UI simple and professional.**
7. **Keep financial calculations automatic.**
8. **Never manually calculate dues in multiple places.**
9. **Treat payment transactions as the source of truth.**
10. **Do not hard-code configurable admission options permanently into React.**
11. **Use Supabase as the database/backend.**
12. **Keep components reusable.**
13. **Handle loading, success, error, and empty states.**
14. **Validate user input.**
15. **Protect financial data.**
16. **Do not add unnecessary features.**
17. **Test every feature after implementation.**
18. **Do not change unrelated files.**
19. **Explain important changes before making them.**
20. **Keep the application easy for a college office employee to understand.**

---

# 51. Definition of Done

A feature is not considered complete simply because the code compiles.

A feature is complete when:

```text
Requirement implemented
        ↓
UI works
        ↓
Database works
        ↓
Validation works
        ↓
Error handling works
        ↓
Responsive behavior checked
        ↓
Existing functionality still works
        ↓
User workflow tested
```

---

# 52. Final Product Vision

The final MVP should feel like a simple college office tool.

A staff member should be able to:

```text
1. Enroll Student
        ↓
2. Enter Fee
        ↓
3. Record Payment
        ↓
4. Automatically see Dues
        ↓
5. Set Due Date
        ↓
6. Generate Fee Slip
        ↓
7. Download / Print
        ↓
8. WhatsApp to Student
        ↓
9. Track Enrollment
        ↓
10. Track Examination
        ↓
11. Issue Admit Card
```

The application should answer three questions immediately:

### Who is the student?

Student and admission information.

### How much money has been paid?

Total Fee / Paid / Dues / Due Date.

### Where is the student's process?

```text
Enrollment in Verification
        ↓
Enrollment Card Issued
        ↓
Examination in Verification
        ↓
Admit Card Issued
```

Keep the entire product focused on these three questions.

---

# END OF AGENTS.md
