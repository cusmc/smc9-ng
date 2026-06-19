export interface ModuleRightsResponse {
  Permission: string; // 8-char Y/N string; PascalCase matches Web API serialization
  Wmodule_id: number;
  Wmodule_nm: string;
}

export interface RightModal {
  View:   boolean;
  Add:    boolean;
  Edit:   boolean;
  Delete: boolean;
  Auth1:  boolean;
  Auth2:  boolean;
  Sp1:    boolean;
  Sp2:    boolean;
}
