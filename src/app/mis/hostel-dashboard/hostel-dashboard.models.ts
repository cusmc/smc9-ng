export interface HostelRawRow {
  Building_nm: string;
  Building_id: number;
  Inst_id:     number;
  Inst_cd:     string;
  ResType:     string;       // 'S' = Student, 'E' = Employee
  Sex:         string | null; // 'M' | 'F' | null (null for staff)
  Cnt:         number;
}

export interface InstInfo {
  Inst_id: number;
  Inst_cd: string;
}

export interface BuildingRow {
  Building_nm: string;
  Building_id: number;
  cells:       Record<string, number | undefined>; // key: `${Inst_cd}_B`, `${Inst_cd}_G`, `${Inst_cd}_E`
  instTotals:  Record<number, number | undefined>; // total per Inst_id (students + staff combined)
  total:       number;
}

export interface HostelKpi {
  total: number;
  boys:  number;
  girls: number;
  staff: number;
}

export interface PivotData {
  institutes: InstInfo[];
  buildings:  BuildingRow[];
  totalRow:   BuildingRow;
  kpi:        HostelKpi;
}
