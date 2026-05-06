export interface StudentCompetency {
  Pk_id: number;
  Studno: string;
  Name?: string;
  Competencyid?: number;
  Description?: string;
  Remarks?: string;
  Dateachieved?: string;
  Mode_nm?: string;
  Decision?: string;
  Rating?: string;
  Comments?: string;
  Status: string;  // 'P'=Pending(student), 'C'=Pending For Review(faculty), 'R'=Complete
  Action?: string;
}

export interface CodeListItem {
  Cd: string;
  vals: string;
  [key: string]: any;
}
