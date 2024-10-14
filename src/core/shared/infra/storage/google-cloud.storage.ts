import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { FileObject, IStorage } from '@/core/shared/application/storage.interface';

export class GoogleCloudStorage implements IStorage {
  constructor(
    private storageSdk: GoogleCloudStorageSdk,
    private bucketName: string,
  ) {}

  async store(object: FileObject): Promise<void> {
    const bucket = this.storageSdk.bucket(this.bucketName);
    const file = bucket.file(object.id);
    return file.save(object.data, {
      metadata: {
        contentType: object.mime_type,
      },
    });
  }

  async get(id: string): Promise<FileObject> {
    const file = this.storageSdk.bucket(this.bucketName).file(id);
    const [metadata, content] = await Promise.all([file.getMetadata(), file.download()]);
    return {
      id,
      data: content[0],
      mime_type: metadata[0].contentType,
    };
  }
}
