import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { Either } from '@/core/shared/domain/either';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';

export class GenresIdExistsInDatabaseValidator {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async validate(genres_id: string[]): Promise<Either<GenreId[], NotFoundError[]>> {
    const genresId = genres_id.map((v) => new GenreId(v));
    const existsResult = await this.genreRepository.existsById(genresId);
    return existsResult.not_exists.length > 0
      ? Either.fail(existsResult.not_exists.map((c) => new NotFoundError(c.value, Genre)))
      : Either.ok(genresId);
  }
}
