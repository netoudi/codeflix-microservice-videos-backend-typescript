import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { CreateGenreInput } from '@/core/genre/application/use-cases/create-genre/create-genre.input';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';

export class CreateGenreUseCase implements IUseCase<CreateGenreInput, CreateGenreOutput> {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly genreRepository: IGenreRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const [categoriesId, errorsCategoriesId] = (
      await this.categoriesIdExistsInDatabase.validate(input.categories_id)
    ).asArray();
    const genre = Genre.create({
      ...input,
      categories_id: errorsCategoriesId ? [] : categoriesId,
    });

    const notification = genre.notification;

    if (errorsCategoriesId) {
      notification.setError(
        errorsCategoriesId.map((e) => e.message),
        'categories_id',
      );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepository.insert(genre);
    });

    const categories = await this.categoryRepository.findByIds(Array.from(genre.categories_id.values()));

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type CreateGenreOutput = GenreOutput;
