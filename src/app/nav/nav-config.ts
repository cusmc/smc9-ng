import { NavModule } from './nav.types';

/**
 * Full application navigation tree.
 *
 * Structure: Module → Group → Item
 *   - migrated: true  → item.route  → Angular router navigation
 *   - migrated: false → item.externalUrl → opens legacy MVC app
 *
 * To add a new migrated module:
 *   1. Set migrated: true
 *   2. Replace externalUrl with route on each item
 *   3. Add the lazy-loaded route to app.routes.ts
 */
export const APP_NAV: NavModule[] = [
  // ─── eLogBook ────────────────────────────────────────────────────────────
  {
    id: 'elogbook',
    label: 'eLogBook',
    icon: 'menu_book',
    baseRoute: '/elogbook',
    migrated: true,
    groups: [
      {
        label: 'Assessment',
        icon: 'assignment',
        items: [
          { label: 'Activities', icon: 'task', route: '/elogbook/activities' },
          { label: 'Competency', icon: 'verified', route: '/elogbook/competency-assessment' },
          { label: 'Examination', icon: 'quiz', route: '/elogbook/examination-assessment' },
          { label: 'Rotational Posting', icon: 'swap_horiz', route: '/elogbook/posting' },
          { label: 'Student Appraisal', icon: 'rate_review', route: '/elogbook/appraisal' },
        ],
      },
      {
        label: 'Masters',
        icon: 'settings',
        items: [
          { label: 'Competency', icon: 'library_books', route: '/elogbook/master/competency' },
          { label: 'Sub-group (Section)', icon: 'category', route: '/elogbook/master/subgroup/Section' },
          { label: 'Sub-group (Speciality)', icon: 'category', route: '/elogbook/master/subgroup/Speciality' },
          { label: 'Exam Master', icon: 'school', route: '/elogbook/master/exam' },
          { label: 'Approving Authority', icon: 'manage_accounts', route: '/elogbook/master/approving-authority' },
          { label: 'Appraisal Parameters', icon: 'tune', route: '/elogbook/master/appraisal-params' },
        ],
      },
      {
        label: 'Reports',
        icon: 'bar_chart',
        items: [
          { label: 'ElogBook Report', icon: 'picture_as_pdf', route: '/elogbook/reports/elogbook' },
          { label: 'Old Data Report', icon: 'history', route: '/elogbook/reports/old-data' },
        ],
      },
    ],
  },

  // ─── Hospital ─────────────────────────────────────────────────────────────
  {
    id: 'hospital',
    label: 'Hospital',
    icon: 'local_hospital',
    baseRoute: '/hospital',
    roles: ['Cashier', 'Admin', 'Hospital'],
    migrated: false,
    groups: [
      {
        label: 'EMR',
        icon: 'folder_shared',
        items: [
          { label: 'Patient Record', icon: 'person_search', externalUrl: '/HMSmast/EMR' },
          { label: 'ABDM', icon: 'health_and_safety', externalUrl: '/HMSmast/ABDM' },
        ],
      },
      {
        label: 'Out Patient',
        icon: 'meeting_room',
        items: [
          { label: 'OPD Entry', icon: 'add_circle', externalUrl: '/OpdMasts/Create' },
          { label: 'OPD Reports', icon: 'bar_chart', externalUrl: '/OpdMasts/Report' },
        ],
      },
      {
        label: 'In Patient',
        icon: 'hotel',
        items: [
          { label: 'Admission', icon: 'add_circle', externalUrl: '/Admissions/Create' },
          { label: 'Ward', icon: 'beenhere', externalUrl: '/Ward/Index' },
          { label: 'Ward Reports', icon: 'bar_chart', externalUrl: '/Ward/Report' },
        ],
      },
      {
        label: 'Billing',
        icon: 'receipt_long',
        items: [
          { label: 'Cashier', icon: 'point_of_sale', externalUrl: '/Billing/Index' },
          { label: 'Insurance Desk', icon: 'verified_user', externalUrl: '/Insurance/Index' },
        ],
      },
      {
        label: 'Diagnostics',
        icon: 'biotech',
        items: [
          { label: 'Radiology', icon: 'radiology', externalUrl: '/Radiology/Index' },
          { label: 'Pathology', icon: 'science', externalUrl: '/Pathology/Index' },
          { label: 'OT Management', icon: 'medical_services', externalUrl: '/OT/Index' },
        ],
      },
      {
        label: 'Masters',
        icon: 'settings',
        items: [
          { label: 'Masters', icon: 'tune', externalUrl: '/HMSmast/Index' },
        ],
      },
    ],
  },

  // ─── Student ──────────────────────────────────────────────────────────────
  {
    id: 'student',
    label: 'Student',
    icon: 'school',
    baseRoute: '/student',
    migrated: true,
    groups: [
      {
        label: 'Academic',
        icon: 'chrome_reader_mode',
        items: [
          { label: 'Dashboard', icon: 'dashboard', externalUrl: '/ECampus/Dashboard' },
          { label: 'Lecture Schedule', icon: 'event', externalUrl: '/ECampus/LectureSchedule' },
          { label: 'Student View', icon: 'person', route: '/student/students' },
          { label: 'Student Receipt', icon: 'receipt', externalUrl: '/ECampus/Receipt' },
          { label: 'Certificate Request', icon: 'workspace_premium', route: '/student/certi-req' },
        ],
      },
      {
        label: 'Library',
        icon: 'local_library',
        items: [
          { label: 'Library', icon: 'book', externalUrl: '/Library/Index' },
        ],
      },
      {
        label: 'Hostel',
        icon: 'holiday_village',
        items: [
          { label: 'Hostel', icon: 'home', externalUrl: '/Hostel/Index' },
        ],
      },
      {
        label: 'Masters',
        icon: 'settings',
        items: [
          { label: 'Masters', icon: 'tune', externalUrl: '/ECampus/Master' },
        ],
      },
      {
        label: 'Reports',
        icon: 'bar_chart',
        items: [
          { label: 'Reports', icon: 'picture_as_pdf', externalUrl: '/ECampus/Report' },
        ],
      },
    ],
  },

  // ─── Store ────────────────────────────────────────────────────────────────
  {
    id: 'store',
    label: 'Store',
    icon: 'warehouse',
    baseRoute: '/store',
    migrated: false,
    groups: [
      {
        label: 'Asset Management',
        icon: 'devices',
        items: [
          { label: 'Track Barcode', icon: 'qr_code_scanner', externalUrl: '/Store/TrackBarcode' },
          { label: 'Barcode Verification', icon: 'verified', externalUrl: '/Store/BarcodeVerification' },
          { label: 'Dead Stock View', icon: 'inventory_2', externalUrl: '/Store/DSView' },
        ],
      },
      {
        label: 'Indent & Requisition',
        icon: 'assignment_add',
        items: [
          { label: 'Online Requisition', icon: 'add_shopping_cart', externalUrl: '/Requisition/Online' },
          { label: 'Online Indent', icon: 'receipt_long', externalUrl: '/Indent/Online' },
          { label: 'Authenticate Requisition', icon: 'approval', externalUrl: '/Requisition/Authenticate' },
          { label: 'Dispatch Details', icon: 'local_shipping', externalUrl: '/Dispatch/Index' },
        ],
      },
      {
        label: 'Sub-store',
        icon: 'store',
        items: [
          { label: 'Consumption Entry', icon: 'edit_note', externalUrl: '/SubStore/Consumption' },
          { label: 'Stock Verification', icon: 'fact_check', externalUrl: '/SubStore/StockVerification' },
          { label: 'Equipment Status', icon: 'handyman', externalUrl: '/SubStore/Equipment' },
        ],
      },
      {
        label: 'Tender',
        icon: 'gavel',
        items: [
          { label: 'Tender', icon: 'description', externalUrl: '/Tender/Index' },
          { label: 'Work Order', icon: 'engineering', route: '/store/work-order' },
          { label: 'Payment Request', icon: 'payments', externalUrl: '/Payment/Request' },
          { label: 'GatePass', icon: 'badge', externalUrl: '/GatePass/Index' },
          { label: 'Condemn / Sold', icon: 'delete_sweep', externalUrl: '/Condemn/Index' },
        ],
      },
      {
        label: 'Masters & Reports',
        icon: 'settings',
        items: [
          { label: 'Masters', icon: 'tune', externalUrl: '/Store/Master' },
          { label: 'Reports', icon: 'bar_chart', externalUrl: '/Store/Report' },
        ],
      },
    ],
  },

  // ─── HR & Payroll ─────────────────────────────────────────────────────────
  {
    id: 'hr',
    label: 'HR',
    icon: 'people',
    baseRoute: '/hr',
    migrated: true,
    groups: [
      {
        label: 'Employee',
        icon: 'badge',
        items: [
          { label: 'Masters', icon: 'manage_accounts', externalUrl: '/HR/Master' },
          { label: 'Family Members', icon: 'group', externalUrl: '/HR/FamilyMember' },
          { label: 'Reports', icon: 'bar_chart', externalUrl: '/HR/Report' },
          { label: 'Document Authorization', icon: 'approval', route: '/hr/docu-auth' },
        ],
      },
      {
        label: 'Attendance',
        icon: 'access_time',
        items: [
          { label: 'Attendance', icon: 'checklist', externalUrl: '/Attend/Index' },
          { label: 'Employee In/Out', icon: 'login', externalUrl: '/Attend/InOut' },
          { label: 'Import NMC Attendance', icon: 'upload', externalUrl: '/Attend/Import' },
        ],
      },
      {
        label: 'Leave',
        icon: 'event_busy',
        items: [
          { label: 'Leave Management', icon: 'beach_access', externalUrl: '/Leave/Index' },
        ],
      },
      {
        label: 'Duty Roster',
        icon: 'calendar_month',
        items: [
          { label: 'Duty Roster', icon: 'schedule', externalUrl: '/DutyRoster/Index' },
          { label: 'Duty Entry', icon: 'edit_calendar', externalUrl: '/DutyRoster/Entry' },
          { label: 'Office Orders', icon: 'description', externalUrl: '/OfficeOrder/Index' },
        ],
      },
      {
        label: 'Payroll',
        icon: 'account_balance_wallet',
        items: [
          { label: 'Payroll', icon: 'payments', externalUrl: '/Payroll/Index' },
          { label: 'SAF', icon: 'savings', externalUrl: '/SAF/Index' },
        ],
      },
    ],
  },

  // ─── Pharmacy ─────────────────────────────────────────────────────────────
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    icon: 'medication',
    baseRoute: '/pharmacy',
    roles: ['PharmacyMenu'],
    migrated: false,
    groups: [
      {
        label: 'Dispensing',
        icon: 'vaccines',
        items: [
          { label: 'View Consumption', icon: 'visibility', externalUrl: '/Pharmacy/Consumption' },
          { label: 'Drug Consumption OPD', icon: 'medication_liquid', externalUrl: '/Pharmacy/OPDConsumption' },
          { label: 'Upload Prescription', icon: 'upload_file', externalUrl: '/Pharmacy/UploadPrescription' },
          { label: 'Daily Prescription Data', icon: 'assignment', externalUrl: '/Pharmacy/DailyData' },
          { label: 'Medicine Order Entry', icon: 'add_shopping_cart', externalUrl: '/Pharmacy/OrderEntry' },
        ],
      },
      {
        label: 'Stock',
        icon: 'inventory',
        items: [
          { label: 'Stock Reports', icon: 'bar_chart', externalUrl: '/Pharmacy/StockReport' },
          { label: 'Rate Contract', icon: 'price_check', route: '/pharmacy/rc-master' },
          { label: 'Form-H Monitor', icon: 'monitor_heart', externalUrl: '/Pharmacy/FormH' },
          { label: 'PO Register', icon: 'list_alt', route: '/pharmacy/po-register' },
          { label: 'Discharge Queue', icon: 'monitor_heart', route: '/pharmacy/discharge-queue' },
        ],
      },
      {
        label: 'Finance',
        icon: 'receipt_long',
        items: [
          { label: 'GST', icon: 'account_balance', externalUrl: '/Pharmacy/GST' },
          { label: 'Customer Outstanding', icon: 'account_balance_wallet', externalUrl: '/Pharmacy/Outstanding' },
          { label: 'Category-wise Sales', icon: 'pie_chart', externalUrl: '/Pharmacy/CategorySales' },
          { label: 'Payment Advice', icon: 'payments', route: '/pharmacy/ph-payment' },
        ],
      },
      {
        label: 'Masters & Reports',
        icon: 'settings',
        items: [
          { label: 'Masters', icon: 'tune', externalUrl: '/Pharmacy/Master' },
          { label: 'Reports', icon: 'bar_chart', externalUrl: '/Pharmacy/Report' },
        ],
      },
    ],
  },

  // ─── Accounts ─────────────────────────────────────────────────────────────
  {
    id: 'accounts',
    label: 'Accounts',
    icon: 'account_balance',
    baseRoute: '/accounts',
    migrated: false,
    groups: [
      {
        label: 'Transactions',
        icon: 'swap_horiz',
        items: [
          { label: 'Party Authentication', icon: 'verified_user', externalUrl: '/Accounts/PartyAuth' },
          { label: 'O/s Register', icon: 'book', externalUrl: '/Accounts/OSRegister' },
          { label: 'FD Report', icon: 'savings', externalUrl: '/Accounts/FDReport' },
          { label: 'Payment Request', icon: 'payments', externalUrl: '/Accounts/PaymentRequest' },
          { label: 'Chq. Payment Forwarding', icon: 'send_and_archive', route: '/accounts/chq-payment' },
        ],
      },
      {
        label: 'Reports',
        icon: 'bar_chart',
        items: [
          { label: 'Department Performance', icon: 'trending_up', externalUrl: '/Accounts/DeptPerformance' },
          { label: 'Reports', icon: 'picture_as_pdf', externalUrl: '/Accounts/Report' },
        ],
      },
      {
        label: 'Masters',
        icon: 'settings',
        items: [
          { label: 'Masters', icon: 'tune', externalUrl: '/Accounts/Master' },
        ],
      },
    ],
  },

  // ─── General ──────────────────────────────────────────────────────────────
  {
    id: 'general',
    label: 'General',
    icon: 'apps',
    baseRoute: '/general',
    migrated: false,
    groups: [
      {
        label: 'Communication',
        icon: 'chat',
        items: [
          { label: 'SMS / Email', icon: 'send', externalUrl: '/Comms/Index' },
          { label: 'Circular', icon: 'article', externalUrl: '/Circular/Index' },
          { label: 'CUSMC Post', icon: 'campaign', externalUrl: '/Post/Index' },
          { label: 'Phone Book', icon: 'contacts', externalUrl: '/PhoneBook/Index' },
        ],
      },
      {
        label: 'Administration',
        icon: 'admin_panel_settings',
        items: [
          { label: 'Code Master', icon: 'code', externalUrl: '/Code/Master' },
          { label: 'Institute Master', icon: 'business', externalUrl: '/Institute/Master' },
          { label: 'Task Manager', icon: 'task_alt', externalUrl: '/Task/Index' },
          { label: 'ABHA Creation', icon: 'health_and_safety', externalUrl: '/ABHA/Create' },
        ],
      },
      {
        label: 'Sports & Activities',
        icon: 'sports',
        items: [
          { label: 'Sports Activity', icon: 'sports_soccer', externalUrl: '/Sports/Index' },
        ],
      },
      {
        label: 'Complain',
        icon: 'report_problem',
        items: [
          { label: 'Complain', icon: 'feedback', externalUrl: '/Complain/Index' },
          { label: 'Complain Master', icon: 'tune', externalUrl: '/Complain/Master' },
        ],
      },
    ],
  },

  // ─── Admin ────────────────────────────────────────────────────────────────
  {
    id: 'admin',
    label: 'Admin',
    icon: 'admin_panel_settings',
    baseRoute: '/admin',
    roles: ['Admin'],
    migrated: true,
    groups: [
      {
        label: 'Module Management',
        icon: 'view_module',
        items: [
          { label: 'Web Modules', icon: 'web', route: '/admin/module-management/web-modules' },
          { label: 'CMS Modules', icon: 'article', route: '/admin/module-management/cms-modules' },
        ],
      },
      {
        label: 'Access Control',
        icon: 'lock',
        items: [
          { label: 'Rights Requests', icon: 'approval', route: '/admin/access-control/rights-requests' },
          { label: 'Access Review (NABH)', icon: 'fact_check', route: '/admin/access-control/access-review' },
        ],
      },
      {
        label: 'Users',
        icon: 'people',
        items: [
          { label: 'User Listing', icon: 'manage_accounts', route: '/admin/users' },
        ],
      },
      {
        label: 'Website CMS',
        icon: 'language',
        items: [
          { label: 'Webpages', icon: 'web', route: '/admin/website/webpages' },
        ],
      },
      {
        label: 'Scheme Configuration',
        icon: 'discount',
        items: [
          { label: 'Scheme Discounts', icon: 'percent', route: '/admin/scheme-discounts' },
        ],
      },
      {
        label: 'System',
        icon: 'settings',
        items: [
          { label: 'Shared Docs', icon: 'link', externalUrl: '/Admin/SharedDocs' },
          { label: 'Audit Trail', icon: 'history', externalUrl: '/AuditData/Index' },
          { label: 'Error Logs', icon: 'bug_report', externalUrl: '/Errorlog/Index' },
        ],
      },
    ],
  },

  // ─── MIS Reports ──────────────────────────────────────────────────────────
  {
    id: 'mis',
    label: 'MIS',
    icon: 'analytics',
    baseRoute: '/mis',
    roles: ['MISMenu'],
    migrated: false,
    groups: [
      {
        label: 'Dashboards',
        icon: 'dashboard',
        items: [
          { label: 'Hospital Dashboard', icon: 'local_hospital', route: '/hims/dashboard' },
          { label: 'Student Dashboard', icon: 'school', externalUrl: '/MIS/Student' },
          { label: 'HR Dashboard', icon: 'people', externalUrl: '/MIS/HR' },
          { label: 'Hostel Dashboard', icon: 'holiday_village', route: '/mis/hostel-dashboard' },
          { label: 'Complain Dashboard', icon: 'report_problem', externalUrl: '/MIS/Complain' },
        ],
      },
      {
        label: 'Reports',
        icon: 'bar_chart',
        items: [
          { label: 'Hosp Performance', icon: 'insert_chart', route: '/mis/hosp-perf' },
          { label: 'Doct Performance', icon: 'people', route: '/mis/doct-perf' },
          { label: 'Circulars', icon: 'article', externalUrl: '/MIS/Circulars' },
          { label: 'On Leave Report', icon: 'event_busy', externalUrl: '/MIS/OnLeave' },
          { label: 'Phone Book', icon: 'contacts', externalUrl: '/MIS/PhoneBook' },
          { label: 'Feedback Review', icon: 'reviews', externalUrl: '/MIS/Feedback' },
          { label: 'E-Memo', icon: 'mail', externalUrl: '/MIS/EMemo' },
        ],
      },
    ],
  },
];
