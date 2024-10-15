import { getModelToken } from '@nestjs/sequelize';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@/core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { UpdateGenreUseCase } from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) => {
      return new GenreSequelizeRepository(genreModel, uow);
    },
    inject: [getModelToken(GenreModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepository: IGenreRepository,
      categoryRepository: ICategoryRepository,
      categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator,
    ) => {
      return new CreateGenreUseCase(uow, genreRepository, categoryRepository, categoriesIdExistsInDatabase);
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (uow: IUnitOfWork, genreRepository: IGenreRepository) => {
      return new DeleteGenreUseCase(uow, genreRepository);
    },
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (genreRepository: IGenreRepository, categoryRepository: ICategoryRepository) => {
      return new GetGenreUseCase(genreRepository, categoryRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide, CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (genreRepository: IGenreRepository, categoryRepository: ICategoryRepository) => {
      return new ListGenresUseCase(genreRepository, categoryRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide, CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepository: IGenreRepository,
      categoryRepository: ICategoryRepository,
      categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator,
    ) => {
      return new UpdateGenreUseCase(uow, genreRepository, categoryRepository, categoriesIdExistsInDatabase);
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
};

export const VALIDATIONS = {
  GENRES_ID_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: CategoriesIdExistsInDatabaseValidator,
    useFactory: (genreRepository: IGenreRepository) => {
      return new GenresIdExistsInDatabaseValidator(genreRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRE_PROVIDERS = { REPOSITORIES, USE_CASES, VALIDATIONS };
