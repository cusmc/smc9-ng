export interface SchemeItem {
  id: number;
  nm: string;
}

export interface DropdownItem {
  id: number;
  nm: string;
}

export interface SchDiscountRow {
  Pk_id: number;
  Schmast_id: number;
  Narrcode: number | null;
  Sgroup_id: number | null;
  Group_id: number | null;
  Rate_nm: string | null;
  DiscountPct: number;
  Wef_dt: string;
  Expdt: string | null;
  Active: boolean;
  Schmast_nm: string;
  Narration: string;
  Sgroup_nm: string;
  Head_nm: string;
  Level: string;   // 'Item' | 'Sub-Group' | 'Head Group'
}

export interface SchDiscountSaveDto {
  Pk_id: number;
  Schmast_id: number;
  Narrcode: number | null;
  Sgroup_id: number | null;
  Group_id: number | null;
  Rate_nm: string | null;
  DiscountPct: number;
  Wef_dt: string;
  Expdt: string | null;
}
