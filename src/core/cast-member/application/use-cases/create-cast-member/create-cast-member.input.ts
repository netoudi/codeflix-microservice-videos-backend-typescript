import { IsInt, IsNotEmpty, IsString, validateSync, ValidationError } from 'class-validator';

export type CreateCastMemberInputConstructor = {
  name: string;
  type: number;
};

export class CreateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  type: number;

  constructor(props: CreateCastMemberInputConstructor) {
    if (!props) return;
    this.name = props.name;
    this.type = props.type;
  }
}

export class ValidateCreateCastMemberInput {
  static validate(input: CreateCastMemberInput): ValidationError[] {
    return validateSync(input);
  }
}
