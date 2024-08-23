import { IsNotEmpty, IsOptional, IsString, validateSync, ValidationError } from 'class-validator';

export type UpdateCategoryInputConstructor = {
  id: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export class UpdateCategoryInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  isActive?: boolean;

  constructor(props: UpdateCategoryInputConstructor) {
    if (!props) return;
    this.id = props.id;
    props.name && (this.name = props.name);
    props.description && (this.description = props.description);
    props.isActive !== undefined && props.isActive !== null && (this.isActive = props.isActive);
  }
}

export class ValidateUpdateCategoryInput {
  static validate(input: UpdateCategoryInput): ValidationError[] {
    return validateSync(input);
  }
}