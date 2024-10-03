import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidationError,
  validateSync,
} from 'class-validator';

export type CreateGenreInputConstructor = {
  name: string;
  categories_id: string[];
  is_active?: boolean;
};

export class CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categories_id: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  constructor(props: CreateGenreInputConstructor) {
    if (!props) return;
    this.name = props.name;
    this.categories_id = props.categories_id;
    this.is_active = props.is_active ?? true;
  }
}

export class ValidateCreateGenreInput {
  static validate(input: CreateGenreInput): ValidationError[] {
    return validateSync(input);
  }
}
