export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}
