import { IsIn, IsNotEmpty, IsString, ValidateNested, ValidationError, validateSync } from 'class-validator';
import { FileMediaInput } from '@/core/video/application/use-cases/common/file-media.input';

export type UploadImageMediasInputProps = {
  video_id: string;
  field: string;
  file: FileMediaInput;
};

export class UploadImageMediasInput {
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['banner', 'thumbnail', 'thumbnail_half'])
  @IsNotEmpty()
  field: string;

  @ValidateNested()
  file: FileMediaInput;

  constructor(props: UploadImageMediasInputProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadImageMediasInput {
  static validate(input: UploadImageMediasInput): ValidationError[] {
    return validateSync(input);
  }
}
