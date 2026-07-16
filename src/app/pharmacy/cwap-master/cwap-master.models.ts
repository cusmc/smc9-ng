export interface ProdListByCompItem {
  Orig_prodno?: number;
  Orig_prodname?: string;
  Orig_comp?: string;
  Orig_mrp?: number;
  Orig_taxableRate?: number;
  Alt_Prodno?: number;
  Alt_prodname?: string;
  Alt_compname?: string;
  Alt_mrp?: number;
  Alt_taxableRate?: number;
  PACKING?: string;
  RATIO?: number;
  PrdGrp_id?: number;
  TYPE?: string;
  Strength_id?: number;
}

export interface CompanyItem {
  id: number;
  nm: string;
}

export interface ProdListByCompBody {
  Firmx: string;
  Yrx: string;
  Comp_id: number;
  Output: string;
}

export interface OrigProductGroup {
  Orig_prodno?: number;
  Orig_prodname?: string;
  Orig_comp?: string;
  Orig_mrp?: number;
  Orig_taxableRate?: number;
  alternatives: ProdListByCompItem[];
  expanded: boolean;
}
