import { IsNotEmpty, IsNumber, IsOptional, IsString, validateSync, ValidationError } from 'class-validator';
import { CastMemberType } from '@/core/cast-member/domain/cast-member.entity';

export type UpdateCastMemberInputConstructor = {
  id: string;
  name?: string;
  type?: number | null;
};

export class UpdateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  type?: CastMemberType;

  constructor(props: UpdateCastMemberInputConstructor) {
    if (!props) return;
    this.id = props.id;
    props.name && (this.name = props.name);
    props.type && (this.type = props.type);
  }
}

export class ValidateUpdateCastMemberInput {
  static validate(input: UpdateCastMemberInput): ValidationError[] {
    return validateSync(input);
  }
}
