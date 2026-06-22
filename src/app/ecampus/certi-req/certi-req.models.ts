export type CertiStatus = '' | 'A' | 'P' | 'D';
export type TabKey = 'all' | 'pending' | 'auth' | 'payment' | 'dispatch';

export interface CertiRequestDto {
  Pk_id:      number | null;
  Studno:     number | null;
  Student_nm: string | null;
  Certi_id:   number | null;
  Certi_nm:   string | null;
  Tdate:      string | null;
  Status:     CertiStatus | null;
  Remarks:    string | null;
  Fees:       number | null;
  Create_by:  string | null;
  Create_dt:  string | null;
}

export interface UpdateStatusPayload {
  Pk_id:  number;
  Status: CertiStatus;
}

export interface TabDef {
  key:    TabKey;
  label:  string;
  status: CertiStatus | null;
}
