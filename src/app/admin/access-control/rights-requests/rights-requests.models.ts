export interface RightsReqView {
  RightsReq_id: number;
  Username: string;
  Fullname: string;
  Wmodule_id: number;
  Wmodule_nm: string;
  Remarks: string;
  Req_dt: string;
  Status: 'P' | 'A' | 'R';
  Actioned_by: string;
  Action_dt: string | null;
  Action_remarks: string;
}

export interface RoleDto {
  Id: string;
  Name: string;
}

export interface ApproveDto {
  RightsReq_id: number;
  Action_remarks: string;
}

export interface ApproveRoleDto {
  RightsReq_id: number;
  RoleId: string;
  RoleName: string;
  Action_remarks: string;
}

export type ActionMode = 'approve-user' | 'approve-role' | 'reject';

export interface ActionDialogData {
  mode: ActionMode;
  request: RightsReqView;
  roles?: RoleDto[];
}

export interface ActionDialogResult {
  mode: ActionMode;
  selectedRole?: RoleDto;
  remarks: string;
}
