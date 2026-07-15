export interface DeptAlosRow {
  Deptid:        number;
  Deptname:      string;
  No_of_patient: number;
  Alos:          number;
}

export interface DischargeStatusRow {
  DisType: string;
  Nos:     number;
  Pct:     number;
}

export interface IcuAlosRow {
  Nustno:        number | null;
  Nustname:      string;
  No_of_patient: number;
  Alos:          number;
}

export interface MonthlyTrendRow {
  Mo:            number;
  No_of_patient: number;
  Alos:          number;
}

export interface DoctorAlosRow {
  Doctid:        number | null;
  Doctname:      string;
  Deptname:      string;
  No_of_patient: number;
  Alos:          number;
}

export interface BedCategoryAlosRow {
  BedCategory:   string;
  No_of_patient: number;
  Alos:          number;
}

export interface UnitAlosRow {
  Nustno:   number;
  Nustname: string;
  Alos:     number;
}
