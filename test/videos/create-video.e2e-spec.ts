import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { VideoId } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';
import { CreateVideoFixture } from '@/modules/videos-module/testing/video-fixture';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

describe('VideosController (e2e)', () => {
  describe('/videos (POST)', () => {
    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = CreateVideoFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/videos')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationErrors = CreateVideoFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/videos')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a video', () => {
      const app = startApp();
      const arrange = CreateVideoFixture.arrangeForSave();
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
        await categoryRepo.bulkInsert(relations.categories);
        await genreRepo.bulkInsert(relations.genres);
        await castMemberRepo.bulkInsert(relations.cast_members);
        const res = await request(app.app.getHttpServer()).post('/videos').send(send_data).expect(201);
        const keyInResponse = CreateVideoFixture.keysInResponse;
        expect(Object.keys(res.body)).toStrictEqual(['data']);
        expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
        const id = res.body.data.id;
        const videoCreated = await videoRepo.findById(new VideoId(id));
        const presenter = VideosController.serialize(
          VideoOutputMapper.toOutput(videoCreated!, relations.categories, relations.genres, relations.cast_members),
        );
        const serialized = instanceToPlain(presenter);
        expect(res.body.data).toStrictEqual({
          id: serialized.id,
          created_at: serialized.created_at,
          ...expected,
        });
      });
    });
  });
});
