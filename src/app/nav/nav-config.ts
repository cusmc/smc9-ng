import { NavModule } from './nav.types';

/**
 * Static navigation entry for the Hospital module only.
 *
 * All other modules are loaded dynamically at runtime from the backend
 * WModule/WRights-driven menu API (see NavService.fetchMenuTree()).
 * Hospital stays static here because its permissions are backed by the
 * separate jMedilan/hModule system, which the dynamic menu API doesn't
 * cover — see NavService.getHospitalModule().
 */
export const APP_NAV: NavModule[] = [
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
];
