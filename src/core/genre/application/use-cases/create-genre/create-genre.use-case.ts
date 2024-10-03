import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { CreateGenreInput } from '@/core/genre/application/use-cases/create-genre/create-genre.input';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';

export class CreateGenreUseCase implements IUseCase<CreateGenreInput, CreateGenreOutput> {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const genre = Genre.create(input);

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.genreRepository.insert(genre);

    return GenreOutputMapper.toOutput(genre);
  }
}

export type CreateGenreOutput = GenreOutput;
