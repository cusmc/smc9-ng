export interface PostingRow {
  Pk_id: number;
  Studno?: string;
  Name?: string;
  Specialty_id: number;
  Specialty_nm?: string;
  Startdate: any;
  Enddate: any;
  Empid: string;
  FacultyName?: string;
  Subject_id?: number;
  Remarks?: string;
  CanTag: string;  // 'N'=active, 'Y'=soft-deleted
  itemno?: number;
  Create_by?: string;
  Create_dt?: string;
}

export interface PostingForm {
  Subject_id: number | null;
  Studno: string | null;
  Remarks: string;
  SubData: PostingRow[];
}

export interface Speciality {
  id: number;
  nm: string;
}

export interface Faculty {
  id: number;
  nm: string;
}
