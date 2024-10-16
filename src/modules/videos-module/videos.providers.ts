import { getModelToken } from '@nestjs/sequelize';
import { CastMembersIdExistsInDatabaseValidator } from '@/core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { ApplicationService } from '@/core/shared/application/application.service';
import { IStorage } from '@/core/shared/application/storage.interface';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CreateVideoUseCase } from '@/core/video/application/use-cases/create-video/create-video.use-case';
import { DeleteVideoUseCase } from '@/core/video/application/use-cases/delete-video/delete-video.use-case';
import { GetVideoUseCase } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { ListVideosUseCase } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { UpdateVideoUseCase } from '@/core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { UploadImageMediasUseCase } from '@/core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@/core/video/infra/db/sequelize/video.model';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepository: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepository,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
      GENRE_PROVIDERS.VALIDATIONS.GENRES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
      CAST_MEMBER_PROVIDERS.VALIDATIONS.CAST_MEMBERS_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  DELETE_VIDEO_USE_CASE: {
    provide: DeleteVideoUseCase,
    useFactory: (uow: IUnitOfWork, videoRepository: IVideoRepository) => {
      return new DeleteVideoUseCase(uow, videoRepository);
    },
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepository: IVideoRepository,
      categoryRepository: ICategoryRepository,
      genreRepository: IGenreRepository,
      castMemberRepository: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(videoRepository, categoryRepository, genreRepository, castMemberRepository);
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  LIST_VIDEOS_USE_CASE: {
    provide: ListVideosUseCase,
    useFactory: (
      videoRepository: IVideoRepository,
      categoryRepository: ICategoryRepository,
      genreRepository: IGenreRepository,
      castMemberRepository: ICastMemberRepository,
    ) => {
      return new ListVideosUseCase(videoRepository, categoryRepository, genreRepository, castMemberRepository);
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepository: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepository,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
      GENRE_PROVIDERS.VALIDATIONS.GENRES_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
      CAST_MEMBER_PROVIDERS.VALIDATIONS.CAST_MEMBERS_ID_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIAS_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    useFactory: (appService: ApplicationService, videoRepository: IVideoRepository, storage: IStorage) => {
      return new UploadAudioVideoMediasUseCase(appService, videoRepository, storage);
    },
    inject: [ApplicationService, REPOSITORIES.VIDEO_REPOSITORY.provide, 'IStorage'],
  },
  UPLOAD_IMAGE_MEDIAS_USE_CASE: {
    provide: UploadImageMediasUseCase,
    useFactory: (uow: IUnitOfWork, videoRepository: IVideoRepository, storage: IStorage) => {
      return new UploadImageMediasUseCase(uow, videoRepository, storage);
    },
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide, 'IStorage'],
  },
};

export const VIDEO_PROVIDERS = { REPOSITORIES, USE_CASES };
