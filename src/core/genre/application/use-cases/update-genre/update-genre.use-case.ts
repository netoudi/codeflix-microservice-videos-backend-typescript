import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { UpdateGenreInput } from '@/core/genre/application/use-cases/update-genre/update-genre.input';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';

export class UpdateGenreUseCase implements IUseCase<UpdateGenreInput, UpdateGenreOutput> {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genre = await this.genreRepository.findById(new GenreId(input.id));

    if (!genre) throw new NotFoundError(input.id, Genre);

    'name' in input && input.name !== undefined && input.name !== null && genre.changeName(input.name);
    'description' in input && input.description !== undefined && genre.changeDescription(input.description);
    'is_active' in input && genre[input.is_active ? 'activate' : 'deactivate']();

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.genreRepository.update(genre);

    return GenreOutputMapper.toOutput(genre);
  }
}

export type UpdateGenreOutput = GenreOutput;
