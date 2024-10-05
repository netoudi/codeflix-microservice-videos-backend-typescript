import { Test, TestingModule } from '@nestjs/testing';
import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@/core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { UpdateGenreUseCase } from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { GenresController } from '@/modules/genres-module/genres.controller';
import { GenresModule } from '@/modules/genres-module/genres.module';
import { GenreCollectionPresenter, GenrePresenter } from '@/modules/genres-module/genres.presenter';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import {
  CreateGenreFixture,
  ListGenresFixture,
  UpdateGenreFixture,
} from '@/modules/genres-module/testing/genre-fixture';

describe('GenresController Integration Tests', () => {
  let controller: GenresController;
  let repository: IGenreRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, GenresModule],
    }).compile();
    controller = module.get<GenresController>(GenresController);
    repository = module.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateGenreUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateGenreUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListGenresUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetGenreUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteGenreUseCase);
  });

  describe('should create a genre', () => {
    const arrange = CreateGenreFixture.arrangeForCreate();
    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.create(send_data);
      const entity = await repository.findById(new Uuid(presenter.id));
      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        name: expected.name,
        description: expected.description,
        is_active: expected.is_active,
        created_at: presenter.created_at,
      });
      const output = GenreOutputMapper.toOutput(entity);
      expect(presenter).toEqual(new GenrePresenter(output));
    });
  });

  describe('should update a genre', () => {
    const arrange = UpdateGenreFixture.arrangeForUpdate();
    const genre = Genre.fake().aGenre().build();

    beforeEach(async () => {
      await repository.insert(genre);
    });

    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.update(genre.id.value, send_data);
      const entity = await repository.findById(new Uuid(presenter.id));
      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        name: expected.name ?? genre.name,
        description: 'description' in expected ? expected.description : genre.description,
        is_active: expected.is_active === true || expected.is_active === false ? expected.is_active : genre.is_active,
        created_at: presenter.created_at,
      });
      const output = GenreOutputMapper.toOutput(entity);
      expect(presenter).toEqual(new GenrePresenter(output));
    });
  });

  it('should delete a genre', async () => {
    const genre = Genre.fake().aGenre().build();
    await repository.insert(genre);
    const response = await controller.remove(genre.id.value);
    expect(response).not.toBeDefined();
    await expect(repository.findById(genre.id)).resolves.toBeNull();
  });

  it('should get a genre', async () => {
    const genre = Genre.fake().aGenre().build();
    await repository.insert(genre);
    const presenter = await controller.findOne(genre.id.value);
    expect(presenter.id).toBe(genre.id.value);
    expect(presenter.name).toBe(genre.name);
    expect(presenter.description).toBe(genre.description);
    expect(presenter.is_active).toBe(genre.is_active);
    expect(presenter.created_at).toStrictEqual(genre.created_at);
  });

  describe('search method', () => {
    describe('should sorted genres by created_at', () => {
      const { entitiesMap, arrange } = ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        expect(presenter).toEqual(
          new GenreCollectionPresenter({
            items: entities.map(GenreOutputMapper.toOutput),
            current_page: paginationProps.meta.current_page,
            last_page: paginationProps.meta.last_page,
            per_page: paginationProps.meta.per_page,
            total: paginationProps.meta.total,
          }),
        );
      });
    });

    describe('should return genres using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        expect(presenter).toEqual(
          new GenreCollectionPresenter({
            items: entities.map(GenreOutputMapper.toOutput),
            current_page: paginationProps.meta.current_page,
            last_page: paginationProps.meta.last_page,
            per_page: paginationProps.meta.per_page,
            total: paginationProps.meta.total,
          }),
        );
      });
    });
  });
});
