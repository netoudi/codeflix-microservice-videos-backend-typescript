import { getModelToken } from '@nestjs/sequelize';
import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@/core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { UpdateGenreUseCase } from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';

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
    useFactory: (genreModel: typeof GenreModel) => {
      return new GenreSequelizeRepository(genreModel);
    },
    inject: [getModelToken(GenreModel)],
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (genreRepository: IGenreRepository) => {
      return new CreateGenreUseCase(genreRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (genreRepository: IGenreRepository) => {
      return new DeleteGenreUseCase(genreRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (genreRepository: IGenreRepository) => {
      return new GetGenreUseCase(genreRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (genreRepository: IGenreRepository) => {
      return new ListGenresUseCase(genreRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (genreRepository: IGenreRepository) => {
      return new UpdateGenreUseCase(genreRepository);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRE_PROVIDERS = { REPOSITORIES, USE_CASES };
