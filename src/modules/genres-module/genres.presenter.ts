import { Transform } from 'class-transformer';
import { GenreOutput } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { ListGenresOutput } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { CollectionPresenter } from '@/modules/shared-module/collection.presenter';

export class GenrePresenter {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: GenreOutput) {
    this.id = output.id;
    this.name = output.name;
    this.description = output.description;
    this.is_active = output.is_active;
    this.created_at = output.created_at;
  }
}

export class GenreCollectionPresenter extends CollectionPresenter {
  data: GenrePresenter[];

  constructor(output: ListGenresOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new GenrePresenter(item));
  }
}
