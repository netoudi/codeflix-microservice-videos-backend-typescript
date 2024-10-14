import { IUseCase } from '@/core/shared/application/use-case.interface';
import { UploadImageMediasInput } from '@/core/video/application/use-cases/upload-image-medias/upload-image-medias.input';

export class UploadImageMediasUseCase implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput> {
  execute(input: UploadImageMediasInput): Promise<UploadImageMediasOutput> {
    throw new Error('Method not implemented.');
  }
}

export type UploadImageMediasOutput = any;
