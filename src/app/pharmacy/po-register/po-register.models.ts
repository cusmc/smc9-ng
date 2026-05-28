export interface PoListItem {
  Tran_id?: number;
  Po_id?: number;
  Po_no?: number;
  Po_dt?: string;
  Account_id?: number;
  Prod_id?: number;
  Descri?: string;
  Qnt?: number;
  Rate?: number;
  Disc_per?: number;
  Disc_amt?: number;
  Total?: number;
  Make?: string;
  Purpack?: string;
  Ratio?: number;
  Prodname?: string;
  Packing?: string;
  Comp_nm?: string;
  Account_nm?: string;
  City_nm?: string;
  Dept_id?: number;
  Rstock?: number;
  Priority?: number;
  Potr_id?: number;
  RcvdQnt?: number;
  BalQnt?: number;
}

export interface MfgItem {
  id: number;
  nm: string;
}

export interface FirmItem {
  id: string;
  nm: string;
}

export interface YearItem {
  id: string;
  nm: string;
}

export interface PartyItem {
  id: number;
  nm: string;
}

export interface ProductItem {
  id: number;
  nm: string;
}

export interface PrintRegBody {
  Firm: string;
  Year: string;
  Status: string;
  Product_id: number;
  Party_id: number;
  Int1: number;
  Output: string;
}
