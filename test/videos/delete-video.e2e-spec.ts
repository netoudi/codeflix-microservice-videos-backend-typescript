import request from 'supertest';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { Video } from '@/core/video/domain/video.aggregate';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

describe('VideosController (e2e)', () => {
  describe('/delete/:id (DELETE)', () => {
    const nestApp = startApp();
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
        return request(nestApp.app.getHttpServer())
          .delete(`/videos/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a video response with status 204', async () => {
      const videoRepo = nestApp.app.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
      const categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
      const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
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

      await request(nestApp.app.getHttpServer()).delete(`/videos/${video.id.value}`).expect(204);

      await expect(videoRepo.findById(video.id)).resolves.toBeNull();
    });
  });
});
