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

export type CreateVideoInputConstructor = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: RatingValues;
  is_opened: boolean;
  categories_id: string[];
  genres_id: string[];
  cast_members_id: string[];
};

export class CreateVideoInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  year_launched: number;

  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsEnum(RatingValues)
  @IsNotEmpty()
  rating: RatingValues;

  @IsBoolean()
  @IsOptional()
  is_opened: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categories_id: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  genres_id: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  cast_members_id: string[];

  constructor(props: CreateVideoInputConstructor) {
    if (!props) return;
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
  }
}

export class ValidateCreateVideoInput {
  static validate(input: CreateVideoInput): ValidationError[] {
    return validateSync(input);
  }
}
