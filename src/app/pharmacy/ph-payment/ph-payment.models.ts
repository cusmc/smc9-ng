export interface AcTranRow {
  tran_id: number;
  narration: string | null;
  tdate: string | null;
  Account_nm: string | null;
  Paid_amt: number | null;
  ACCOUNT_ID: number | null;
  ENTRYNO: number | null;
  vou_no: string | null;
  Vtype: string | null;
  Vou_nm: string | null;
  mobile: string | null;
  email: string | null;
  selected?: boolean;
}

export interface PayDetailRow {
  TDATE: string | null;
  BILLNO: string | null;
  BILL_AMT: number | null;
  PAID_AMT: number | null;
  DUE_AMT: number | null;
  CONTRA_OS: number | null;
  ORIG_ID: number | null;
}

export interface PhSendRequest {
  firmx: string;
  yrx: string;
  tran_ids: number[];
  notify_type: string;
}

export interface PhNotifyResult {
  tran_id: number;
  account_nm: string;
  queued_wa: boolean;
  queued_email: boolean;
  message: string;
}
