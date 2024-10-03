import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('GetGenreUseCase Integration Tests', () => {
  let useCase: GetGenreUseCase;
  let repository: GenreSequelizeRepository;

  setupSequelize({ models: [GenreModel] });

  beforeEach(() => {
    repository = new GenreSequelizeRepository(GenreModel);
    useCase = new GetGenreUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, Genre));
  });

  it('should return a genre', async () => {
    const genre = Genre.fake().aGenre().build();
    await repository.insert(genre);
    const output = await useCase.execute({ id: genre.id.value });
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      description: genre.description,
      is_active: genre.is_active,
      created_at: genre.created_at,
    });
  });
});
