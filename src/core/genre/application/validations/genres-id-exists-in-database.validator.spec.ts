import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';

describe('GenresIdExistsInDatabaseValidator Unit Tests', () => {
  let genreRepository: GenreInMemoryRepository;
  let validator: GenresIdExistsInDatabaseValidator;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    validator = new GenresIdExistsInDatabaseValidator(genreRepository);
  });

  it('should return many not found error when genres id is not exists in database', async () => {
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const spyExistsById = jest.spyOn(genreRepository, 'existsById');
    let [genresId, errorsGenresId] = await validator.validate([genreId1.value, genreId2.value]);
    expect(genresId).toStrictEqual(null);
    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId1.value, Genre),
      new NotFoundError(genreId2.value, Genre),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const genre1 = Genre.fake().aGenre().build();
    await genreRepository.insert(genre1);

    [genresId, errorsGenresId] = await validator.validate([genre1.id.value, genreId2.value]);
    expect(genresId).toStrictEqual(null);
    expect(errorsGenresId).toStrictEqual([new NotFoundError(genreId2.value, Genre)]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of genres id', async () => {
    const genre1 = Genre.fake().aGenre().build();
    const genre2 = Genre.fake().aGenre().build();
    await genreRepository.bulkInsert([genre1, genre2]);
    const [genresId, errorsGenresId] = await validator.validate([genre1.id.value, genre2.id.value]);
    expect(genresId).toHaveLength(2);
    expect(errorsGenresId).toStrictEqual(null);
    expect(genresId[0]).toBeValueObject(genre1.id);
    expect(genresId[1]).toBeValueObject(genre2.id);
  });
});
