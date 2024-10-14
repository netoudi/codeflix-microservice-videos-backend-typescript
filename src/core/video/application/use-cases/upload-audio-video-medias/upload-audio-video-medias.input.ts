import { IsIn, IsNotEmpty, IsString, ValidateNested, ValidationError, validateSync } from 'class-validator';
import { FileMediaInput } from '@/core/video/application/use-cases/common/file-media.input';

export type UploadAudioVideoMediasInputProps = {
  video_id: string;
  field: string;
  file: FileMediaInput;
};

export class UploadAudioVideoMediasInput {
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: string;

  @ValidateNested()
  file: FileMediaInput;

  constructor(props: UploadAudioVideoMediasInputProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadAudioVideoMediasInput {
  static validate(input: UploadAudioVideoMediasInput): ValidationError[] {
    return validateSync(input);
  }
}
