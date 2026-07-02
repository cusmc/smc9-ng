export interface LotListItem {
  lot_id: number;
  dept: string;
}

export interface ChqSummaryRow {
  party_id: number;
  party_nm: string;
  paid_amt: number | null;
  Paym_amt: number | null;
  chq_no: string | null;
  paym_dt: string | null;
  dept: string | null;
  bank_nm: string | null;
  rtgs: boolean | null;
  utr_no: string | null;
  utr_dt: string | null;
  mobile: string | null;
  email: string | null;
  paym_id: number | null;
  selected?: boolean;
}

export interface ChqDetailRow {
  party_id: number | null;
  bill_no: string | null;
  bill_dt: string | null;
  bill_amt: number | null;
  paid_amt: number | null;
  due_amt: number | null;
  remark: string | null;
}

export interface UpdateUtrRequest {
  paym_ids: number[];
  utr_no: string;
  utr_dt: string | null;
}

export interface SendNotificationRequest {
  lot_id: number;
  party_ids: number[];
  notify_type: string;
}

export interface NotifyResult {
  party_id: number;
  party_nm: string;
  queued_wa: boolean;
  queued_email: boolean;
  message: string;
}
