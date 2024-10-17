import { Readable } from 'node:stream';
import { BadRequestException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { InMemoryStorage } from '@/core/shared/infra/storage/in-memory.storage';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { CreateVideoUseCase } from '@/core/video/application/use-cases/create-video/create-video.use-case';
import { DeleteVideoUseCase } from '@/core/video/application/use-cases/delete-video/delete-video.use-case';
import { GetVideoUseCase } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { ListVideosUseCase } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { UpdateVideoUseCase } from '@/core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@/core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { UploadImageMediasUseCase } from '@/core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { SharedModule } from '@/modules/shared-module/shared.module';
import {
  CreateVideoFixture,
  ListVideosFixture,
  UpdateVideoFixture,
} from '@/modules/videos-module/testing/video-fixture';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VideosModule } from '@/modules/videos-module/videos.module';
import { VideoCollectionPresenter } from '@/modules/videos-module/videos.presenter';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

class FileFactory {
  static createImage(field: string) {
    return {
      fieldname: field,
      originalname: 'image.jpg',
      mimetype: 'image/jpeg',
      size: 100,
      buffer: Buffer.from('some data'),
      encoding: '',
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
  }

  static createVideo(field: string) {
    return {
      fieldname: field,
      originalname: 'video.mp4',
      mimetype: 'video/mp4',
      size: 100,
      buffer: Buffer.from('some data'),
      encoding: '',
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
  }
}

describe('VideosController Integration Tests', () => {
  let controller: VideosController;
  let genreRepository: IGenreRepository;
  let categoryRepository: ICategoryRepository;
  let castMemberRepository: ICastMemberRepository;
  let videoRepository: IVideoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, SharedModule, VideosModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .overrideProvider('IStorage')
      .useValue(new InMemoryStorage())
      .compile();
    controller = await module.resolve(VideosController);
    genreRepository = module.get(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
    categoryRepository = module.get(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
    castMemberRepository = module.get(CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide);
    videoRepository = module.get(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateVideoUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateVideoUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListVideosUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetVideoUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteVideoUseCase);
    expect(controller['uploadAudioVideoMedia']).toBeInstanceOf(UploadAudioVideoMediasUseCase);
    expect(controller['uploadImageMedia']).toBeInstanceOf(UploadImageMediasUseCase);
  });

  describe('should create a video', () => {
    const arrange = CreateVideoFixture.arrangeForSave();

    test.each(arrange)('when body is $send_data', async ({ send_data, expected, relations }) => {
      await categoryRepository.bulkInsert(relations.categories);
      await genreRepository.bulkInsert(relations.genres);
      await castMemberRepository.bulkInsert(relations.cast_members);
      const presenter = await controller.create(send_data);
      const entity = await videoRepository.findById(new Uuid(presenter.id));

      expect(entity!.toJSON()).toStrictEqual({
        id: presenter.id,
        title: expected.title,
        description: expected.description,
        year_launched: expected.year_launched,
        duration: expected.duration,
        rating: expected.rating,
        is_opened: expected.is_opened,
        is_published: expected.is_published,
        banner: null,
        thumbnail: null,
        thumbnail_half: null,
        trailer: null,
        video: null,
        categories_id: expected.categories_id,
        genres_id: expected.genres_id,
        cast_members_id: expected.cast_members_id,
        created_at: presenter.created_at,
      });

      const expectedPresenter = VideosController.serialize(
        VideoOutputMapper.toOutput(entity!, relations.categories, relations.genres, relations.cast_members),
      );
      expectedPresenter.categories = expect.arrayContaining(expectedPresenter.categories);
      expectedPresenter.categories_id = expect.arrayContaining(expectedPresenter.categories_id);
      expectedPresenter.genres = expect.arrayContaining(expectedPresenter.genres);
      expectedPresenter.genres_id = expect.arrayContaining(expectedPresenter.genres_id);
      expectedPresenter.cast_members = expect.arrayContaining(expectedPresenter.cast_members);
      expectedPresenter.cast_members_id = expect.arrayContaining(expectedPresenter.cast_members_id);
      expect(presenter).toEqual(expectedPresenter);
    });
  });

  describe('should update a video', () => {
    const arrange = UpdateVideoFixture.arrangeForSave();

    test.each(arrange)('with request $send_data', async ({ entity: video, send_data, expected, relations }) => {
      await categoryRepository.bulkInsert(relations.categories);
      await genreRepository.bulkInsert(relations.genres);
      await castMemberRepository.bulkInsert(relations.cast_members);
      await videoRepository.insert(video);
      const presenter = await controller.update(video.id.value, send_data);
      const videoUpdated = await videoRepository.findById(new VideoId(presenter.id));

      expect(videoUpdated!.toJSON()).toStrictEqual({
        id: presenter.id,
        title: expected.title,
        description: video.description,
        year_launched: video.year_launched,
        duration: video.duration,
        rating: video.rating.value,
        is_opened: expected.is_opened,
        is_published: video.is_published,
        banner: null,
        thumbnail: null,
        thumbnail_half: null,
        trailer: null,
        video: null,
        categories_id: expected.categories_id,
        genres_id: [...video.genres_id.values()].map((i) => i.value),
        cast_members_id: [...video.cast_members_id.values()].map((i) => i.value),
        created_at: presenter.created_at,
      });

      const expectedPresenter = VideosController.serialize(
        VideoOutputMapper.toOutput(videoUpdated!, relations.categories, relations.genres, relations.cast_members),
      );
      expectedPresenter.categories = expect.arrayContaining(expectedPresenter.categories);
      expectedPresenter.categories_id = expect.arrayContaining(expectedPresenter.categories_id);
      expectedPresenter.genres = expect.arrayContaining(expectedPresenter.genres);
      expectedPresenter.genres_id = expect.arrayContaining(expectedPresenter.genres_id);
      expectedPresenter.cast_members = expect.arrayContaining(expectedPresenter.cast_members);
      expectedPresenter.cast_members_id = expect.arrayContaining(expectedPresenter.cast_members_id);
      expect(presenter).toEqual(expectedPresenter);
    });
  });

  it('should delete a video', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepository.insert(genre);
    const cast_member = CastMember.fake().aCastMember().build();
    await castMemberRepository.insert(cast_member);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(cast_member.id)
      .build();
    await videoRepository.insert(video);
    const response = await controller.remove(video.id.value);
    expect(response).not.toBeDefined();
    await expect(videoRepository.findById(video.id)).resolves.toBeNull();
  });

  it('should get a video', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepository.insert(genre);
    const cast_member = CastMember.fake().aCastMember().build();
    await castMemberRepository.insert(cast_member);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(cast_member.id)
      .build();
    await videoRepository.insert(video);
    const presenter = await controller.findOne(video.id.value);
    expect(presenter.id).toBe(video.id.value);
    expect(presenter.title).toBe(video.title);
    expect(presenter.categories).toEqual([
      {
        id: category.id.value,
        name: category.name,
        created_at: category.created_at,
      },
    ]);
    expect(presenter.categories_id).toEqual(expect.arrayContaining(Array.from(video.categories_id.keys())));
    expect(presenter.created_at).toStrictEqual(video.created_at);
  });

  describe('search method', () => {
    describe('should return videos using query empty ordered by created_at', () => {
      const { relations, entitiesMap, arrange } = ListVideosFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepository.bulkInsert(Array.from(relations.categories.values()));
        await genreRepository.bulkInsert(Array.from(relations.genres.values()));
        await castMemberRepository.bulkInsert(Array.from(relations.cast_members.values()));
        await videoRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        const expectedPresenter = new VideoCollectionPresenter({
          items: entities.map((e) => ({
            ...e.toJSON(),
            id: e.id.value,
            categories_id: expect.arrayContaining(Array.from(e.categories_id.keys())),
            categories: Array.from(e.categories_id.keys()).map((id) => ({
              id: relations.categories.get(id)!.id.value,
              name: relations.categories.get(id)!.name,
              created_at: relations.categories.get(id)!.created_at,
            })),
            genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
            genres: Array.from(e.genres_id.keys()).map((id) => ({
              id: relations.genres.get(id)!.id.value,
              name: relations.genres.get(id)!.name,
              created_at: relations.genres.get(id)!.created_at,
            })),
            cast_members_id: expect.arrayContaining(Array.from(e.cast_members_id.keys())),
            cast_members: Array.from(e.cast_members_id.keys()).map((id) => ({
              id: relations.cast_members.get(id)!.id.value,
              name: relations.cast_members.get(id)!.name,
              created_at: relations.cast_members.get(id)!.created_at,
            })),
          })),
          ...paginationProps.meta,
        });
        presenter.data = presenter.data.map((item) => ({
          ...item,
          categories: expect.arrayContaining(item.categories),
        }));
        expect(presenter).toEqual(expectedPresenter);
      });
    });

    describe('should return videos using pagination, sort and filter', () => {
      const { relations, entitiesMap, arrange } = ListVideosFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepository.bulkInsert(Array.from(relations.categories.values()));
        await genreRepository.bulkInsert(Array.from(relations.genres.values()));
        await castMemberRepository.bulkInsert(Array.from(relations.cast_members.values()));
        await videoRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $label', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        const expectedPresenter = new VideoCollectionPresenter({
          items: entities.map((e) => ({
            ...e.toJSON(),
            id: e.id.value,
            categories_id: expect.arrayContaining(Array.from(e.categories_id.keys())),
            categories: Array.from(e.categories_id.keys()).map((id) => ({
              id: relations.categories.get(id)!.id.value,
              name: relations.categories.get(id)!.name,
              created_at: relations.categories.get(id)!.created_at,
            })),
            genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
            genres: Array.from(e.genres_id.keys()).map((id) => ({
              id: relations.genres.get(id)!.id.value,
              name: relations.genres.get(id)!.name,
              created_at: relations.genres.get(id)!.created_at,
            })),
            cast_members_id: expect.arrayContaining(Array.from(e.cast_members_id.keys())),
            cast_members: Array.from(e.cast_members_id.keys()).map((id) => ({
              id: relations.cast_members.get(id)!.id.value,
              name: relations.cast_members.get(id)!.name,
              created_at: relations.cast_members.get(id)!.created_at,
            })),
          })),
          ...paginationProps.meta,
        });
        presenter.data = presenter.data.map((item) => ({
          ...item,
          categories: expect.arrayContaining(item.categories),
        }));
        expect(presenter).toEqual(expectedPresenter);
      });
    });
  });

  describe('uploadFile method', () => {
    let video: Video;

    beforeEach(async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);
      const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
      await genreRepository.insert(genre);
      const cast_member = CastMember.fake().aCastMember().build();
      await castMemberRepository.insert(cast_member);
      video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.id)
        .addGenreId(genre.id)
        .addCastMemberId(cast_member.id)
        .build();
      await videoRepository.insert(video);
    });

    it('should upload a image', async () => {
      for (const field of ['banner', 'thumbnail', 'thumbnail_half']) {
        await controller.uploadFile(video.id.value, { [field]: [FileFactory.createImage(field)] });
        const output = await videoRepository.findById(video.id);
        expect(output![field].name).toBeDefined();
      }
    });

    it('should upload a video', async () => {
      for (const field of ['trailer', 'video']) {
        await controller.uploadFile(video.id.value, { [field]: [FileFactory.createVideo(field)] });
        const output = await videoRepository.findById(video.id);
        expect(output![field].name).toBeDefined();
      }
    });

    it('should throw error when has more than one file', async () => {
      await expect(
        controller.uploadFile(video.id.value, {
          trailer: [FileFactory.createVideo('trailer')],
          video: [FileFactory.createVideo('video')],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when file type is invalid', async () => {
      await expect(
        controller.uploadFile(video.id.value, { banner: [FileFactory.createVideo('trailer')] }),
      ).rejects.toThrow(EntityValidationError);
      await expect(
        controller.uploadFile(video.id.value, { trailer: [FileFactory.createImage('trailer')] }),
      ).rejects.toThrow(EntityValidationError);
    });
  });
});
