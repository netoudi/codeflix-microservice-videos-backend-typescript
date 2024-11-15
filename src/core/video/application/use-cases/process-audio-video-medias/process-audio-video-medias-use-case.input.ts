import { IsEnum, IsIn, IsNotEmpty, IsString, IsUUID, MaxLength, ValidationError, validateSync } from 'class-validator';
import { AudioVideoMediaStatus } from '@/core/shared/domain/value-objects/audio-video-media.vo';

export type ProcessAudioVideoMediasUseCaseInputProps = {
  video_id: string;
  field: string;
  status: AudioVideoMediaStatus;
  encoded_location: string;
};

export class ProcessAudioVideoMediasUseCaseInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: string;

  @IsEnum(AudioVideoMediaStatus)
  @IsNotEmpty()
  status: AudioVideoMediaStatus;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  encoded_location: string;

  constructor(props: ProcessAudioVideoMediasUseCaseInputProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.status = props.status;
    this.encoded_location = props.encoded_location;
  }
}

export class ValidateProcessAudioVideoMediasUseCaseInput {
  static validate(input: ProcessAudioVideoMediasUseCaseInput): ValidationError[] {
    return validateSync(input);
  }
}
