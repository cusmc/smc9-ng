export interface Activity {
  Pk_id: number;
  Studno: string;
  Activityid: number;
  Status: string;  // 'P'=Pending, 'C'=Complete
  Grade: string;   // 'E'=Exceeds, 'M'=Meets, 'B'=Below
  Comments: string;
  Remarks: string;
  Edate: string;
  Empid: string;
  Subject_id?: number;
  Activity_nm?: string;
  Mode_nm?: string;
  Title?: string;
  Detail_nm?: string;
  No_of_docu?: number;
  Create_dt?: string;
  Name?: string;
  FacultyName?: string;
  Canverify?: boolean;
  Action?: string;  // 'U'=Update, 'R'=Revert
}

// Server response shape (same as Activity, Canverify set client-side)
export type ActivityDashboard = Activity;

export interface Student {
  No: string;    // studno — matches API response field name
  Name: string;  // studname
  [key: string]: any;
}

export interface Subject {
  Subject_id: number;
  Subject_nm: string;
  [key: string]: any;
}

export interface CodeListItem {
  Cd: string;    // code value — matches API response field name
  vals: string;  // display label
  [key: string]: any;
}
