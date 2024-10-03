import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CreateGenreUseCase Integration Tests', () => {
  let useCase: CreateGenreUseCase;
  let repository: GenreSequelizeRepository;

  setupSequelize({ models: [GenreModel] });

  beforeEach(() => {
    repository = new GenreSequelizeRepository(GenreModel);
    useCase = new CreateGenreUseCase(repository);
  });

  it('should create a new genre', async () => {
    let output = await useCase.execute({ name: 'test' });
    let genre = await repository.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: genre!.id.value,
      name: 'test',
      description: null,
      is_active: true,
      created_at: genre!.created_at,
    });
    output = await useCase.execute({ name: 'test', description: 'some description', is_active: false });
    genre = await repository.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: genre!.id.value,
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: genre!.created_at,
    });
  });
});
