export interface UserReviewRow {
  UserName: string;
  Fullname: string;
  Email: string;
  Usertype: string;
  Status: string;
  AllowLogin: boolean;
  DeptName: string;
  Dept_id: number;
  Desg_id: number;
}

export interface AccessReviewRow {
  Username: string;
  Fullname: string;
  Status: string;
  AllowLogin: boolean;
  Usertype: string;
  ModuleName: string;
  Wmodule_id: number;
  // 8-char string: positions 0-5 map to View/Add/Edit/Delete/Auth1/Auth2 ('Y'/'N')
  Permission: string;
}
