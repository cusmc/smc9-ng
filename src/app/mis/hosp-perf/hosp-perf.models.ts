export interface PerfRow {
  TDate:    string;
  Section:  string;
  Category: string;
  Value:    number;
}

export interface PerfRequest {
  Fdate:       string;
  Tdate:       string;
  Dept_id:     number | null;
  Subdept_id:  number | null;
  Doctor_id:   number | null;
  Pmjay_ids:   string | null;
  Private_ids: string | null;
}

export interface CompSeries extends PerfRequest {
  Label: string;
}

export interface CompareRequest {
  Series: CompSeries[];
}

export interface CompareSeries {
  Label: string;
  Fdate: string;
  Tdate: string;
  Data:  PerfRow[];
}

export interface LookupItem {
  id: number;
  nm: string;
}

export interface TableRow {
  label:      string;
  values:     number[];
  isTotal:    boolean;
  isCurrency: boolean;
}
