import { IsEnum, MaxLength } from 'class-validator';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ClassValidatorFields } from '@/core/shared/domain/validators/class-validator-fields';
import { Notification } from '@/core/shared/domain/validators/notification';

// bypass, import doesn't work with IsEnum
enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2,
}

export class CastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  @IsEnum(CastMemberType, { groups: ['type'] })
  type: CastMemberType;

  constructor(castMember: CastMember) {
    Object.assign(this, castMember);
  }
}

export class CastMemberValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name', 'type'];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create(): CastMemberValidator {
    return new CastMemberValidator();
  }
}
