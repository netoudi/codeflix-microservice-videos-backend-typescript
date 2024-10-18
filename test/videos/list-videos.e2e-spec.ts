import qs from 'qs';
import request from 'supertest';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { IVideoRepository } from '@/core/video/domain/video.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';
import { ListVideosFixture } from '@/modules/videos-module/testing/video-fixture';
import { VIDEO_PROVIDERS } from '@/modules/videos-module/videos.providers';

describe('VideosController (e2e)', () => {
  describe('/videos (GET)', () => {
    describe('should return videos sorted by created_at when request query is empty', () => {
      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberRepo: ICastMemberRepository;
      const nestApp = startApp();
      const { relations, entitiesMap, arrange } = ListVideosFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        videoRepo = nestApp.app.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        castMemberRepo = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Array.from(relations.categories.values()));
        await genreRepo.bulkInsert(Array.from(relations.genres.values()));
        await castMemberRepo.bulkInsert(Array.from(relations.cast_members.values()));
        await videoRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const queryParams = new URLSearchParams(send_data as any).toString();
        const data = expected.entities.map((e) => ({
          id: e.id.value,
          title: e.title,
          description: e.description,
          year_launched: e.year_launched,
          duration: e.duration,
          rating: e.rating.value,
          is_opened: e.is_opened,
          is_published: e.is_published,
          categories_id: expect.arrayContaining(Array.from(e.categories_id.keys())),
          categories: expect.arrayContaining(
            Array.from(relations.categories.values())
              .filter((c) => e.categories_id.has(c.id.value))
              .map((c) => ({
                id: c.id.value,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
          ),
          genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
          genres: expect.arrayContaining(
            Array.from(relations.genres.values())
              .filter((c) => e.genres_id.has(c.id.value))
              .map((c) => ({
                id: c.id.value,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
          ),
          cast_members_id: expect.arrayContaining(Array.from(e.cast_members_id.keys())),
          cast_members: expect.arrayContaining(
            Array.from(relations.cast_members.values())
              .filter((c) => e.cast_members_id.has(c.id.value))
              .map((c) => ({
                id: c.id.value,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
          ),
          created_at: e.created_at.toISOString(),
        }));
        const response = await request(nestApp.app.getHttpServer()).get(`/videos/?${queryParams}`).expect(200);
        expect(response.body).toStrictEqual({
          data: data,
          meta: expected.meta,
        });
      });
    });

    describe('should return videos using paginate, filter and sort', () => {
      let videoRepo: IVideoRepository;
      let categoryRepo: ICategoryRepository;
      let genreRepo: IGenreRepository;
      let castMemberREpo: ICastMemberRepository;

      const nestApp = startApp();
      const { relations, entitiesMap, arrange } = ListVideosFixture.arrangeUnsorted();

      beforeEach(async () => {
        videoRepo = nestApp.app.get<IVideoRepository>(VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide);
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        castMemberREpo = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Array.from(relations.categories.values()));
        await genreRepo.bulkInsert(Array.from(relations.genres.values()));
        await castMemberREpo.bulkInsert(Array.from(relations.cast_members.values()));
        await videoRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const queryParams = qs.stringify(send_data as any);
        const data = expected.entities.map((e) => ({
          id: e.id.value,
          title: e.title,
          description: e.description,
          year_launched: e.year_launched,
          duration: e.duration,
          rating: e.rating.value,
          is_opened: e.is_opened,
          is_published: e.is_published,
          categories_id: expect.arrayContaining(Array.from(e.categories_id.keys())),
          categories: expect.arrayContaining(
            Array.from(relations.categories.values())
              .filter((c) => e.categories_id.has(c.id.value))
              .map((c) => ({
                id: c.id.value,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
          ),
          genres_id: expect.arrayContaining(Array.from(e.genres_id.keys())),
          genres: expect.arrayContaining(
            Array.from(relations.genres.values())
              .filter((c) => e.genres_id.has(c.id.value))
              .map((c) => ({
                id: c.id.value,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
          ),
          cast_members_id: expect.arrayContaining(Array.from(e.cast_members_id.keys())),
          cast_members: expect.arrayContaining(
            Array.from(relations.cast_members.values())
              .filter((c) => e.cast_members_id.has(c.id.value))
              .map((c) => ({
                id: c.id.value,
                name: c.name,
                created_at: c.created_at.toISOString(),
              })),
          ),
          created_at: e.created_at.toISOString(),
        }));
        const response = await request(nestApp.app.getHttpServer()).get(`/videos/?${queryParams}`).expect(200);
        expect(response.body).toStrictEqual({
          data: data,
          meta: expected.meta,
        });
      });
    });
  });
});
