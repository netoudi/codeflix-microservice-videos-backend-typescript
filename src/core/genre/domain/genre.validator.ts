import { MaxLength } from 'class-validator';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { ClassValidatorFields } from '@/core/shared/domain/validators/class-validator-fields';
import { Notification } from '@/core/shared/domain/validators/notification';

export class GenreRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(genre: Genre) {
    Object.assign(this, genre);
  }
}

export class GenreValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new GenreRules(data), newFields);
  }
}

export class GenreValidatorFactory {
  static create(): GenreValidator {
    return new GenreValidator();
  }
}
