export interface WorkOrderSaveDto {
  Pk_id: number;
  Wo_no: number;
  Wo_dt: string;
  Party_id: number;
  Party_nm: string;
  Dept_id: number | null;
  Account_id: number | null;
  Quotno: string;
  Quotdt: string | null;
  Tendor_no: string;
  Tendor_dt: string | null;
  Delivery: string;
  Payterm: number | null;
  Payterms: string;
  Compl_dt: string | null;
  Narration: string;
  Sanc_by: string;
  Totbill: number;
  Disc: number;
  Netbill: number;
  Freight: number;
  Packing: number;
  Lines: WorkOrderLineDto[];
}

export interface WorkOrderLineDto {
  Pk_id: number;
  Prodno: number;
  Descri: string;
  Speci: string;
  Qnt: number;
  Rate: number;
  Amount: number;
  Ratio: number | null;
  Dept_id: number | null;
  Tender_id: number | null;
  Make: string;
  Disc_per: number;
  Disc_amt: number;
  St_per: number;
  St_amt: number;
  Ex_per: number;
  Ex_amt: number;
  Cst_per: number;
  Cst_amt: number;
  Vat_per: number;
  Vat_amt: number;
  Total: number;
}

export interface WorkOrderListItem {
  Pk_id: number;
  Wo_no: number;
  Wo_dt: string;
  Party_nm: string;
  DeptNm: string;
  Netbill: number;
  Pending: boolean;
  Narration: string;
  Compl_dt: string | null;
}

export interface WorkOrderDetailDto {
  Header: WorkOrderSaveDto;
  Lines: WorkOrderLineDto[];
}

export interface PartyItem {
  Party_id: number;
  Party_nm: string;
}

export interface ProductItem {
  Prodno: number;
  Prodname: string;
}

export interface DeptItem {
  Dept_id: number;
  Dept_nm: string;
}

export interface TenderItem {
  Pk_id: number;
  Tender_no: string;
}
