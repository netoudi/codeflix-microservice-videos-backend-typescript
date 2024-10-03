import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('ListGenresUseCase Integration Tests', () => {
  let useCase: ListGenresUseCase;
  let repository: GenreSequelizeRepository;

  setupSequelize({ models: [GenreModel] });

  beforeEach(() => {
    repository = new GenreSequelizeRepository(GenreModel);
    useCase = new ListGenresUseCase(repository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const genres = Genre.fake()
      .theGenres(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();
    await repository.bulkInsert(genres);
    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...genres].reverse().map(GenreOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return output using pagination, sort and filter', async () => {
    const genres = [
      new Genre({ name: 'a' }),
      new Genre({ name: 'AAA' }),
      new Genre({ name: 'AaA' }),
      new Genre({ name: 'b' }),
      new Genre({ name: 'c' }),
    ];
    await repository.bulkInsert(genres);
    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [genres[1], genres[2]].map(GenreOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [genres[0]].map(GenreOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });
    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [genres[0], genres[2]].map(GenreOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
