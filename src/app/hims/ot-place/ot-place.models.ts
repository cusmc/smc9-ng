export interface Otplace {
  Pk_id: number;
  Dept_id: number | null;
  Deptname?: string;
  Place: string;
  Userx: string;
  BillMode: string | null;
}

export interface OprTableRow {
  Pk_id: number;
  Otplace_id: number;
  TableNo: string;
  TableName: string | null;
  Major: boolean;
  Minor: boolean;
  Supra: boolean;
  Procx: boolean;
  Invx: boolean;
  IsActive: boolean;
  Remarks: string | null;
  DeptIds: number[];
}
