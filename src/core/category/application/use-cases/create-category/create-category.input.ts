import { IsBoolean, IsNotEmpty, IsOptional, IsString, validateSync, ValidationError } from 'class-validator';

export type CreateCategoryInputConstructor = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class CreateCategoryInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  constructor(props: CreateCategoryInputConstructor) {
    if (!props) return;
    this.name = props.name;
    this.description = props.description;
    this.is_active = props.is_active;
  }
}

export class ValidateCreateCategoryInput {
  static validate(input: CreateCategoryInput): ValidationError[] {
    return validateSync(input);
  }
}
