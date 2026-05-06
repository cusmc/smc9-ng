export interface AppraisalHeader {
  Appraisalid: number;
  Studno: string;
  Courseid: number;
  Appraisaldate?: string;
  Overallcomments?: string;
  Assessorid?: string;
  Create_dt?: string;
  Create_by?: string;
}

export interface AppraisalDetail {
  Detailid: number;
  Appraisalid: number;
  Parameterid: number;
  Score: number | null;
  Comments: string;
  CanTag: string;
  itemno?: number;
  Descr?: string;
  Code?: string;
  Maxscore?: number;
  Isheader?: boolean;
}

export interface AppraisalVM {
  Header: Partial<AppraisalHeader>;
  Details: AppraisalDetail[];
}

export interface Course {
  Course_id: number;
  Course_nm: string;
}
