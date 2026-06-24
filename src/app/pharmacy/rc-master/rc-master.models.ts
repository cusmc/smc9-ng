export interface RcMastListItem {
  Rc_id: number;
  Party_id: number | null;
  Mfg_id: number | null;
  Account_nm: string;
  Mfg_nm: string;
  Rc_no: string;
  Rc_type_id: number | null;
  Rc_type_nm: string;
  Fdate: string;
  Tdate: string;
  Status: string;
  Create_by: string;
}

export interface RcTranDto {
  Rctran_id: number;
  Rc_id: number;
  Prod_id: number | null;
  Prod_nm: string;
  Prate: number | null;
  Max_qty: number | null;
  Fq_base: number | null;
  Fq_free: number | null;
  CanTag: string;
}

export interface RcMastSaveDto {
  Rc_id: number;
  Party_id: number | null;
  Mfg_id: number | null;
  Rc_no: string;
  Rc_type_id: number | null;
  Fdate: string;
  Tdate: string;
  Status: string;
  SubData: RcTranDto[];
}

export interface IdNm {
  id: number;
  nm: string;
}

export interface RcTypeItem extends IdNm {}
