export interface FactSheetNumberRow {
  Grp:                string;
  SrNo:               number;
  Label:              string;
  MonthlyValue:       number;
  AnnualizedEstimate: number | null;
  Remarks:            string | null;
}

export interface FactSheetBedRow {
  WardLabel: string;
  BedCount:  number;
}

export interface FactSheetWardRow {
  Nustno:   number;
  Nustname: string;
  Deptid:   number;
  Nusttype: string | null;
  BedCapa:  number | null;
}

export interface FactSheetOtRow {
  Place:  string;
  DeptId: number;
  Major:  boolean;
  Minor:  boolean;
  Supra:  boolean;
  Procx:  boolean;
}

export interface FactSheetCathlabRow {
  CathlabCount: number;
}

export interface FactSheetStaffRow {
  Category: string;
  EmpCount: number;
}

export interface FactSheetResponse {
  Numbers:  FactSheetNumberRow[];
  Beds:     FactSheetBedRow[];
  WardsRaw: FactSheetWardRow[];
  OtMaster: FactSheetOtRow[];
  Cathlab:  FactSheetCathlabRow;
  Staff:    FactSheetStaffRow[];
}
