export interface UserDetail {
  UserName: string;
  FullName: string;
  PhoneNumber: string;
  Email: string;
  usertype: string;
  Status: string;
  Deptnm: string;
  category: string;
}

export interface AppUser {
  Id: string;
  UserName: string;
  fullname: string;
  PhoneNumber: string;
  Email: string;
  Status: string;
  usertype: string;
  dept_id: number;
  desg_id: number;
  AllowLogin: boolean;
  Roles: UserRoleEntry[];
}

export interface UserRoleEntry {
  UserId: string;
  RoleId: string;
}

export interface RoleItem {
  id: string;
  name: string;
  Roleid: string;
  Assigned: boolean;
  Old_Assigned: boolean;
}

export interface UserSaveDto {
  Id?: string;
  Username: string;
  FullName: string;
  PhoneNumber?: string;
  Email?: string;
  Status: string;
  UserType?: string;
  AllowLogin?: boolean;
  Password?: string;
  Roles?: RoleItem[];
}

export interface UserRightsRecord {
  WModule_id: number;
  WModule_nm: string;
  permission: string;
  RoleName: string;
  RightType: string;
}

export interface UserModuleItem {
  Wmodule_id: number;
  Wmodule_nm: string;
  Cont_name: string;
  View_name: string;
  Params: string;
  Permission: string;
}
