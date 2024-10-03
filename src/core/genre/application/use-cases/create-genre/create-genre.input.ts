import { IsBoolean, IsNotEmpty, IsOptional, IsString, validateSync, ValidationError } from 'class-validator';

export type CreateGenreInputConstructor = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  constructor(props: CreateGenreInputConstructor) {
    if (!props) return;
    this.name = props.name;
    this.description = props.description;
    this.is_active = props.is_active;
  }
}

export class ValidateCreateGenreInput {
  static validate(input: CreateGenreInput): ValidationError[] {
    return validateSync(input);
  }
}
