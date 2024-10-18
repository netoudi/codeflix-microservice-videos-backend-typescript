import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { Video } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';
import { GetVideoFixture } from '@/modules/videos-module/testing/video-fixture';
import { VideosController } from '@/modules/videos-module/videos.controller';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

describe('VideosController (e2e)', () => {
  const nestApp = startApp();
  describe('/videos/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message: 'Entity Video with id 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer()).get(`/videos/${id}`).expect(expected.statusCode).expect(expected);
      });
    });

    it('should return a video ', async () => {
      const videoRepo = nestApp.app.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
      const categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
      const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const categories = Category.fake().theCategories(3).build();
      await categoryRepo.bulkInsert(categories);
      const genres = Genre.fake().theGenres(3).addCategoryId(categories[0].id).build();
      await genreRepo.bulkInsert(genres);
      const cast_members = CastMember.fake().theCastMembers(3).build();
      await castMemberRepo.bulkInsert(cast_members);
      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addGenreId(genres[2].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .addCastMemberId(cast_members[2].id)
        .build();
      await videoRepo.insert(video);

      const res = await request(nestApp.app.getHttpServer()).get(`/videos/${video.id.value}`).expect(200);
      const keyInResponse = GetVideoFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = VideosController.serialize(VideoOutputMapper.toOutput(video, categories, genres, cast_members));
      const serialized = instanceToPlain(presenter);
      serialized.categories_id = expect.arrayContaining(serialized.categories_id);
      serialized.categories = expect.arrayContaining(
        serialized.categories.map((category) => ({
          id: category.id,
          name: category.name,
          created_at: category.created_at,
        })),
      );
      serialized.genres_id = expect.arrayContaining(serialized.genres_id);
      serialized.genres = expect.arrayContaining(
        serialized.genres.map((genre) => ({
          id: genre.id,
          name: genre.name,
          created_at: genre.created_at,
        })),
      );
      serialized.cast_members_id = expect.arrayContaining(serialized.cast_members_id);
      serialized.cast_members = expect.arrayContaining(
        serialized.cast_members.map((cast_member) => ({
          id: cast_member.id,
          name: cast_member.name,
          created_at: cast_member.created_at,
        })),
      );
      expect(res.body.data).toEqual(serialized);
    });
  });
});
