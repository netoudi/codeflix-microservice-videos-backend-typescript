import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidationError, validateSync } from 'class-validator';

export type UpdateGenreInputConstructor = {
  id: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export class UpdateGenreInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  constructor(props: UpdateGenreInputConstructor) {
    if (!props) return;
    this.id = props.id;
    props.name && (this.name = props.name);
    props.description && (this.description = props.description);
    props.is_active !== undefined && props.is_active !== null && (this.is_active = props.is_active);
  }
}

export class ValidateUpdateGenreInput {
  static validate(input: UpdateGenreInput): ValidationError[] {
    return validateSync(input);
  }
}
