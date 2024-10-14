import { FileObject, IStorage } from '@/core/shared/application/storage.interface';

export class InMemoryStorage implements IStorage {
  private storage: Map<string, FileObject> = new Map();

  async store(object: FileObject): Promise<void> {
    this.storage.set(object.id, object);
  }

  async get(id: string): Promise<FileObject> {
    const object = this.storage.get(id);
    if (!object) {
      throw new Error(`File ${id} not found`);
    }
    return object;
  }
}
