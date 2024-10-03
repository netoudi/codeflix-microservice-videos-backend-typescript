import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';

export class GetGenreUseCase implements IUseCase<GetGenreInput, GetGenreOutput> {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(input: GetGenreInput): Promise<GetGenreOutput> {
    const genre = await this.genreRepository.findById(new GenreId(input.id));

    if (!genre) throw new NotFoundError(input.id, Genre);

    return GenreOutputMapper.toOutput(genre);
  }
}

export type GetGenreInput = {
  id: string;
};

export type GetGenreOutput = GenreOutput;
