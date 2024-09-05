import { IsBoolean, IsNotEmpty, IsOptional, IsString, validateSync, ValidationError } from 'class-validator';

export type CreateCategoryInputConstructor = {
  name: string;
  description?: string | null;
  isActive?: boolean;
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
  isActive?: boolean;

  constructor(props: CreateCategoryInputConstructor) {
    if (!props) return;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive;
  }
}

export class ValidateCreateCategoryInput {
  static validate(input: CreateCategoryInput): ValidationError[] {
    return validateSync(input);
  }
}
