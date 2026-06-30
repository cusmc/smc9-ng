export interface DoctPerfReq {
  Fdate:      string;
  Tdate:      string;
  Dept_id:    number | null;
  Subdept_id: number | null;
  Doctor_id:  number | null;
  Doctcate:   string;
}

export interface PerfRow {
  TDate:    string;
  Section:  string;
  Category: string;
  Value:    number;
}

export interface DoctPerfRow {
  TDate:     string;
  Doctor_id: number;
  Doctor_nm: string;
  Section:   string;
  Category:  string;
  Value:     number;
}

export interface LookupItem {
  id: number;
  nm: string;
}

export interface CategoryItem {
  Cd:   string;
  vals: string;
}

export interface TableRow {
  label:      string;
  values:     number[];
  isTotal:    boolean;
  isCurrency: boolean;
}

export interface DoctorSummaryRow {
  doctorId:   number;
  doctorNm:   string;
  opdPmjay:   number;
  opdPrivate: number;
  opdOthers:  number;
  opdTotal:   number;
  ipdPmjay:   number;
  ipdPrivate: number;
  ipdOthers:  number;
  ipdTotal:   number;
  surSupra:   number;
  surMajor:   number;
  surMinor:   number;
  surTotal:   number;
  revHosp:    number;
  revDiag:    number;
  revPharm:   number;
  revTotal:   number;
}
