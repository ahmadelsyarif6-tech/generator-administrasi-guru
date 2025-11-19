
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'guru' | 'user';
  email: string;
}

export enum GeneratorType {
  ADMINISTRASI = 'ADMINISTRASI',
  BANK_SOAL = 'BANK_SOAL',
  ECOURSE = 'ECOURSE',
}

export interface GeneratedResult {
  id: string;
  type: GeneratorType;
  title: string;
  content: string; // HTML or Markdown content
  createdAt: Date;
  deadline?: string; // ISO Date string for deadline
}

export interface NavItem {
  label: string;
  path: string;
  icon: any; // Lucide icon component
  roles?: string[];
}
