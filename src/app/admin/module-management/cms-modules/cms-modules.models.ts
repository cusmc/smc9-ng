export interface Cmodule {
  Module_id: number;
  Objcode: string;
  Name: string;
  Prompt: string;
  Command: string;
  Levelname: string;
  Defrights: string;
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
