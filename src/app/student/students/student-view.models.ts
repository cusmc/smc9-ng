export interface StudentListItem {
  name: string;
  admyear: number | null;
  no: number;
  Inst_id: number;
  stat: string;
  batch_id: number | null;
  cursem: string;
  semrollno: string;
}

export interface StudentDetail {
  Pk_id: number;
  No: number;
  Name: string;
  Address: string;
  City: string;
  Phone: string;
  Studmob1: number | null;
  Parmob1: number | null;
  Email: string;
  Fname: string;
  Mname: string;
  Bnames: string;
  Snames: string;
  Empl_id: number | null;
  Sex: string;
  Birthdt: string | null;
  Birthpl: string;
  Nation: string;
  Religion: string;
  Cast: string;
  Mstatus: string;
  Bgroup: string;
  Catagory: string;
  Idmarks: string;
  Allergic: string;
  Merit_no: number | null;
  Merit_mark: number | null;
  Gcet_marks: string;
  Hostel: string;
  Admdt: string | null;
  Admyear: number | null;
  Board: string;
  Course_id: number | null;
  Tdept_id: number | null;
  Quota: string;
  Uni_no: string;
  Fees: number | null;
  Remarks: string;
  Free_no: string;
  Free_dt: string | null;
  Cursem: string;
  batch_id: number | null;
  Semrollno: string;
  JoinDate: string | null;
  Bank_id: number | null;
  Bankacno: string;
  Bankacnm: string;
  Stat: string;
  Inst_id: number;
}

export interface StudentWithPhoto {
  student: StudentDetail;
  base64String1: string;
}

export interface StudentLedgerRecord {
  Date: string;
  sem: string;
  amt: number;
  crdb: number;
  receiptno: number;
  narr: string;
}

export interface StudentResultRecord {
  Result_id: number;
  Result_dt: string;
  Subject_id: number;
  Mbbs: number | null;
  Pext1: number | null;
  Pext2: number | null;
  Pres: number | null;
  Ptot: number | null;
  Text1: number | null;
  Text2: number | null;
  Tint: number | null;
  Tres: number | null;
  Ttot: number | null;
}
