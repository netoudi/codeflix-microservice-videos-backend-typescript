import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { UpdateGenreInput } from '@/core/genre/application/use-cases/update-genre/update-genre.input';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';

export class UpdateGenreUseCase implements IUseCase<UpdateGenreInput, UpdateGenreOutput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly genreRepository: IGenreRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genre = await this.genreRepository.findById(new GenreId(input.id));

    if (!genre) throw new NotFoundError(input.id, Genre);

    'name' in input && input.name !== undefined && input.name !== null && genre.changeName(input.name);
    'is_active' in input && input.is_active !== undefined && genre[input.is_active ? 'activate' : 'deactivate']();

    const notification = genre.notification;

    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdExistsInDatabase.validate(input.categories_id)
      ).asArray();

      categoriesId && genre.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
    }

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return await this.genreRepository.update(genre);
    });

    const categories = await this.categoryRepository.findByIds(Array.from(genre.categories_id.values()));

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;
