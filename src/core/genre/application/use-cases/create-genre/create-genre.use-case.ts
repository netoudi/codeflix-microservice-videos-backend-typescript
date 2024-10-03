import { CategoryId } from '@/core/category/domain/category.entity';
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
  ) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const genre = Genre.create({
      ...input,
      categories_id: input.categories_id.map((id) => new CategoryId(id)),
    });

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepository.insert(genre);
    });

    const categories = await this.categoryRepository.findByIds(Array.from(genre.categories_id.values()));

    return GenreOutputMapper.toOutput(genre, categories);
  }
}

export type CreateGenreOutput = GenreOutput;
