import { IsArray, IsUUID, ValidateNested, ValidationError, validateSync } from 'class-validator';
import { SearchInput } from '@/core/shared/application/search-input';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class ListGenresFilter {
  name?: string | null;
  @IsUUID('4', { each: true })
  @IsArray()
  categories_id?: string[] | null;
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection | null;
  @ValidateNested()
  filter?: ListGenresFilter | null;
}

export class ValidateListGenresInput {
  static validate(input: ListGenresInput): ValidationError[] {
    return validateSync(input);
  }
}
