export interface DailySummary {
  Opd_Gen:  number;
  Opd_Casu: number;
}

export interface DeptDetail {
  DeptName: string;
  Opd:     number;
  Adm:     number;
  Dis:     number;
  Rem:     number;  // current inpatients (remaining); bed capacity not in SP
  Major:   number;
  Minor:   number;
  DayCare: number;
}

// Group_id: 1 = Pathology, 2 = Radiology
export interface InvestigationItem {
  Group_id:  number;
  Sgroup_nm: string;
  Qnt:       number;
  Amt:       number;
}

export interface PhysioItem {
  DeptName: string;
  New_case: number;
  Old_case: number;
  Total:    number;
}

export interface SurgeonItem {
  Doctname: string;
  Total:    number;
}

export interface DashboardBundle {
  summary:        DailySummary[];     // array from API — consume [0]
  deptDetails:    DeptDetail[];
  investigations: InvestigationItem[];
  physio:         PhysioItem[];
  surgeons:       SurgeonItem[];
}
