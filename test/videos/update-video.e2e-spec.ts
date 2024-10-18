import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';
import { UpdateVideoFixture } from '@/modules/videos-module/testing/video-fixture';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

describe('VideosController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/videos/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = Video.fake().aVideoWithoutMedias();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          send_data: { title: faker.title },
          expected: {
            message: 'Entity Video with id 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          send_data: { title: faker.title },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, send_data, expected }) => {
        return request(nestApp.app.getHttpServer())
          .patch(`/videos/${id}`)
          .send(send_data)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateVideoFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/videos/${uuid}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationErrors = UpdateVideoFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        videoRepo = app.app.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
        categoryRepo = app.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
        genreRepo = app.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });
      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
        await genreRepo.insert(genre);
        const cast_member = CastMember.fake().aCastMember().build();
        await castMemberRepo.insert(cast_member);
        const video = Video.fake()
          .aVideoWithoutMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(cast_member.id)
          .build();
        await videoRepo.insert(video);
        return request(app.app.getHttpServer())
          .patch(`/videos/${video.id.value}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a video', () => {
      const app = startApp();
      const arrange = UpdateVideoFixture.arrangeForSave();
      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        videoRepo = app.app.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
        categoryRepo = app.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
        genreRepo = app.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });

      test.each(arrange)('when body is $send_data', async ({ send_data, expected, relations }) => {
        const category = Category.fake().aCategory().build();
        const categories = [category, ...relations.categories];
        await categoryRepo.bulkInsert(categories);

        const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
        const genres = [genre, ...relations.genres];
        await genreRepo.bulkInsert(genres);

        const cast_member = CastMember.fake().aCastMember().build();
        const cast_members = [cast_member, ...relations.cast_members];
        await castMemberRepo.bulkInsert(cast_members);

        const videoCreated = Video.fake()
          .aVideoWithoutMedias()
          .addCategoryId(category.id)
          .addGenreId(genre.id)
          .addCastMemberId(cast_member.id)
          .build();
        await videoRepo.insert(videoCreated);

        const res = await request(app.app.getHttpServer())
          .patch(`/videos/${videoCreated.id.value}`)
          .send(send_data)
          .expect(200);

        const keyInResponse = UpdateVideoFixture.keysInResponse;
        expect(Object.keys(res.body)).toStrictEqual(['data']);
        expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
        const id = res.body.data.id;
        const videoUpdated = await videoRepo.findById(new VideoId(id));
        const presenter = VideosController.serialize(
          VideoOutputMapper.toOutput(videoUpdated!, categories, genres, cast_members),
        );
        const serialized = instanceToPlain(presenter);
        expect(res.body.data).toStrictEqual({
          ...serialized,
          ...expected,
        });
      });
    });
  });
});
