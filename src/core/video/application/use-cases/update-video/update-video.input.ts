import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
  ValidationError,
} from 'class-validator';
import { RatingValues } from '@/core/video/domain/rating.vo';

export type UpdateVideoInputConstructor = {
  id: string;
  title?: string;
  description?: string;
  year_launched?: number;
  duration?: number;
  rating?: RatingValues;
  is_opened?: boolean;
  categories_id?: string[];
  genres_id?: string[];
  cast_members_id?: string[];
};

export class UpdateVideoInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  year_launched?: number;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsEnum(RatingValues)
  @IsOptional()
  rating?: RatingValues;

  @IsBoolean()
  @IsOptional()
  is_opened?: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categories_id?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  genres_id?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  cast_members_id?: string[];

  constructor(props: UpdateVideoInputConstructor) {
    if (!props) return;
    this.id = props.id;
    props.title && (this.title = props.title);
    props.description && (this.description = props.description);
    props.year_launched && (this.year_launched = props.year_launched);
    props.duration && (this.duration = props.duration);
    props.rating && (this.rating = props.rating);
    (props.is_opened === true || props.is_opened === false) && (this.is_opened = props.is_opened);
    props.categories_id && props.categories_id.length > 0 && (this.categories_id = props.categories_id);
    props.genres_id && props.genres_id.length > 0 && (this.genres_id = props.genres_id);
    props.cast_members_id && props.cast_members_id.length > 0 && (this.cast_members_id = props.cast_members_id);
  }
}

export class ValidateUpdateVideoInput {
  static validate(input: UpdateVideoInput): ValidationError[] {
    return validateSync(input);
  }
}
