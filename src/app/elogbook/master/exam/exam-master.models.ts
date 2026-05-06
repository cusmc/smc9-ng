export interface ExamMast {
  Exam_id: number;
  Exam_nm: string;
  Course_id: number;
  Subject_id?: number;
  Section_id?: number;
  Admyear?: string;
  Maxmarkst?: number;
  Minmarkst?: number;
  Maxmarksp?: number;
  Minmarksp?: number;
  Remarks?: string;
  Create_by?: string;
  Create_dt?: string;
  Subject_nm?: string;
  Course_nm?: string;
}

export interface Course {
  Course_id: number;
  Course_nm: string;
}

export interface Subject {
  Subject_id: number;
  Subject_nm: string;
  Course_id: number;
}

export interface Section {
  Subgroup_id: number;
  Subgroup_nm: string;
  Subgroup_type: string;
}
