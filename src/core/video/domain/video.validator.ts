import { MaxLength } from 'class-validator';
import { ClassValidatorFields } from '@/core/shared/domain/validators/class-validator-fields';
import { Notification } from '@/core/shared/domain/validators/notification';
import { Video } from '@/core/video/domain/video.aggregate';

export class VideoRules {
  @MaxLength(255, { groups: ['title'] })
  title: string;

  constructor(video: Video) {
    Object.assign(this, video);
  }
}

export class VideoValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['title'];
    return super.validate(notification, new VideoRules(data), newFields);
  }
}

export class VideoValidatorFactory {
  static create(): VideoValidator {
    return new VideoValidator();
  }
}
