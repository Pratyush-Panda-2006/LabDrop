export type VaultMode = 'upload' | 'retrieve';

export interface VaultFile {
  key: string;
  name: string;
  size: number;
  created_at: string;
  updated_at?: string;
  comment?: string;
  uploaderName?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  file?: VaultFile;
  files?: VaultFile[];
  storageType?: 'supabase' | 'local_demo';
  downloadUrl?: string;
  data?: T;
}
