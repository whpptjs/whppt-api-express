export type StorageService = {
  upload: (fileBuffer: Buffer, id: string, type: string, meta: any) => Promise<void>;
  uploadImage: (fileBuffer: Buffer, id: string, meta: any) => Promise<void>;
  uploadDoc: (fileBuffer: Buffer, id: string, meta: any) => Promise<void>;
  fetch: (id: string, type: string) => Promise<Buffer>;
  fetchImage: (id: string) => Promise<Buffer>;
  fetchDoc: (id: string) => Promise<Buffer>;
  remove: (id: string, type: string) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  removeDoc: (id: string) => Promise<void>;
};
