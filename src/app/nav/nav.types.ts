export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  externalUrl?: string;
}

export interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

export interface NavModule {
  id: string;
  label: string;
  icon: string;
  baseRoute: string;
  /** Roles required to see this module. Empty/undefined = visible to all authenticated users. */
  roles?: string[];
  /** true = fully migrated Angular routes; false = links open legacy MVC app */
  migrated: boolean;
  groups: NavGroup[];
}
