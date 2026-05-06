export interface ExamResult {
  Examres_id: number;
  Exam_id: number;
  Studname?: string;
  Exam_nm?: string;
  Course_nm?: string;
  ObtMarkst?: number;
  Maxmarkst?: number;
  ObtMarksp?: number;
  Maxmarksp?: number;
  Create_by?: string;
  Create_dt?: string;
  Status: string;  // 'P'=Pending, 'A'=Authenticated, 'R'=Rejected
}

export interface AuthPayload {
  Examres_id: number;
  Status: string;
  Comments: string;
}
