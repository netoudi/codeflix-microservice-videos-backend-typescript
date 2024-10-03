import { DeleteGenreUseCase } from '@/core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('DeleteGenreUseCase Integration Tests', () => {
  let useCase: DeleteGenreUseCase;
  let repository: GenreSequelizeRepository;

  setupSequelize({ models: [GenreModel] });

  beforeEach(() => {
    repository = new GenreSequelizeRepository(GenreModel);
    useCase = new DeleteGenreUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, Genre));
  });

  it('should delete a genre', async () => {
    const genre = Genre.fake().aGenre().build();
    await repository.insert(genre);
    await useCase.execute({ id: genre.id.value });
    await expect(repository.findById(genre.id)).resolves.toBeNull();
  });
});
