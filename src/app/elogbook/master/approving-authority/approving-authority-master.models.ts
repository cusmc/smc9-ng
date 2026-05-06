export interface StudGuide {
  Pk_id: number;
  Studno: string;
  Srno?: number;
  Empid: number;
  Empnm?: string;
  Guidetype_id?: number;
  Guidetype_nm?: string;
  CanTag?: string;
}

export interface Student {
  No: any;
  Name: any;
}

export interface GuideList {
  StudGuide: string;
}
