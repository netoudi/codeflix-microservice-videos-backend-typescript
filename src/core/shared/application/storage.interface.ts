export type FileObject = {
  id: string;
  data: Buffer;
  mime_type?: string;
};

export interface IStorage {
  store(object: FileObject): Promise<void>;
  get(id: string): Promise<FileObject>;
}
