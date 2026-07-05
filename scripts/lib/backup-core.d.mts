export declare const BACKUPS_BUCKET: string;

export interface BackupMeta {
  createdAt: string;
  bytes: number;
  contentRows: number;
  orders: number;
  categories: number;
  items: number;
  users: number;
  storageFiles: number;
  imagesEmbedded: number;
}

export declare function assertKey(encryptionKey: string | undefined): void;

export declare function createBackupBuffer(opts: {
  supabaseUrl: string;
  secretKey: string;
  encryptionKey: string;
  withImages?: boolean;
}): Promise<{ buffer: Buffer; meta: BackupMeta }>;

export declare function decryptBackup(raw: Buffer, encryptionKey: string): BackupPayload;

export declare function restoreFromBackup(
  backup: BackupPayload,
  opts: { supabaseUrl: string; secretKey: string },
): Promise<string[]>;

export interface BackupPayload {
  version: number;
  createdAt: string;
  supabaseUrl: string;
  tables: {
    site_content: unknown[];
    orders: unknown[];
    categories?: unknown[];
    menu_items?: unknown[];
  };
  authUsers: { id: string; email: string | null; role: string | null; created_at: string }[];
  storage?: { bucket: string; files: string[]; images: { path: string; base64: string }[] };
}
