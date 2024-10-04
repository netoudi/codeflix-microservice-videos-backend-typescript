import { IsArray, IsUUID, ValidateNested, ValidationError, validateSync } from 'class-validator';
import { SearchInput } from '@/core/shared/application/search-input';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class ListGenresFilter {
  name?: string;
  @IsUUID('4', { each: true })
  @IsArray()
  categories_id?: string[];
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: ListGenresFilter;
}

export class ValidateListGenresInput {
  static validate(input: ListGenresInput): ValidationError[] {
    return validateSync(input);
  }
}
