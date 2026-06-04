export const DEFAULT_LABELS = ['View', 'Add', 'Edit', 'Delete', 'Auth1', 'Auth2', 'Sp1', 'Sp2'];

export function getModuleLabels(mod: Wmodule): string[] {
  if (!mod?.Rights_Labels) return [...DEFAULT_LABELS];
  try {
    const parsed = JSON.parse(mod.Rights_Labels);
    if (Array.isArray(parsed)) {
      return Array.from({ length: 8 }, (_, i) => parsed[i] || DEFAULT_LABELS[i]);
    }
  } catch { /* fall through */ }
  return [...DEFAULT_LABELS];
}

export function permToChecks(perm: string | null | undefined): boolean[] {
  return Array.from({ length: 8 }, (_, i) => (perm ?? '').charAt(i) === 'Y');
}

export function checksToPerm(checks: boolean[]): string {
  return checks.map(c => (c ? 'Y' : 'N')).join('');
}

export interface Wmodule {
  Wmodule_id: number;
  Wmodule_nm: string;
  Cont_name: string;
  View_name: string;
  Params: string;
  Parent_id?: number;
  LoginRequire?: string;
  Priority?: number;
  Rights_Labels?: string;
  labelArr?: string[];
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
  checks?: boolean[];
}

export interface GroupWright {
  UserName: string;
  FullName: string;
  Wrights_id: number;
  Permission: string;
  checks?: boolean[];
}

export interface RightsRecord {
  UserName: string;
  FullName: string;
  Wmodule_nm: string;
  Permission: string;
  RoleName: string;
  Type: string;
}
