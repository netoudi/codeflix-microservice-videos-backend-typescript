import { IsArray, IsUUID, ValidateNested, ValidationError, validateSync } from 'class-validator';
import { SearchInput } from '@/core/shared/application/search-input';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class ListVideosFilter {
  title?: string;
  @IsUUID('4', { each: true })
  @IsArray()
  categories_id?: string[];
  @IsUUID('4', { each: true })
  @IsArray()
  genres_id?: string[];
  @IsUUID('4', { each: true })
  @IsArray()
  cast_members_id?: string[];
}

export class ListVideosInput implements SearchInput<ListVideosFilter> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: ListVideosFilter;
}

export class ValidateListVideosInput {
  static validate(input: ListVideosInput): ValidationError[] {
    return validateSync(input);
  }
}
