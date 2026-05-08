export interface Wmodule {
  Wmodule_id: number;
  Wmodule_nm: string;
  Cont_name: string;
  View_name: string;
  Params: string;
  Parent_id?: number;
  LoginRequire?: string;
  Priority?: number;
}

export interface UserWright {
  UserName: string;
  FullName: string;
  PhoneNumber: string;
  Email: string;
  Wrights_id: number;
  Permission: string;
  Deptnm: string;
  category: string;
}

export interface GroupWright {
  Id: string;
  Name: string;
  Wrights_id: number;
  Permission: string;
}

export interface RightsRecord {
  UserName: string;
  FullName: string;
  Wmodule_nm: string;
  Permission: string;
  RoleName: string;
  Type: string;
}
