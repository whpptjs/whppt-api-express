export type StorageService = {
  upload: (fileBuffer: Buffer, id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fetch: (id: string) => Promise<{ fileBuffer: Buffer }>;
  uploadImage: (fileBuffer: Buffer, id: string) => Promise<void>;
  uploadDoc: (fileBuffer: Buffer, id: string, meta: any) => Promise<void>;
  fetchImage: (id: string) => Promise<{ imageBuffer: Buffer }>;
  fetchDoc: (id: string) => Promise<{ imageBuffer: Buffer }>;
  removeImage: (id: string) => Promise<void>;
  removeDoc: (id: string) => Promise<void>;
};
