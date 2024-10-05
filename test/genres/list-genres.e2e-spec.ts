import qs from 'qs';
import request from 'supertest';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { ListGenresFixture } from '@/modules/genres-module/testing/genre-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('GenresController (e2e)', () => {
  describe('/genres (GET)', () => {
    describe('should return genres sorted by created_at when request query is empty', () => {
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { relations, entitiesMap, arrange } = ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Array.from(relations.categories.values()));
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $label', async ({ send_data, expected }) => {
        const queryParams = new URLSearchParams(send_data as any).toString();
        const data = expected.entities.map((e) => ({
          id: e.id.value,
          name: e.name,
          is_active: e.is_active,
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
          created_at: e.created_at.toISOString(),
        }));
        const response = await request(nestApp.app.getHttpServer()).get(`/genres/?${queryParams}`).expect(200);
        expect(response.body).toStrictEqual({
          data: data,
          meta: expected.meta,
        });
      });
    });

    describe('should return genres using paginate, filter and sort', () => {
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;

      const nestApp = startApp();
      const { relations, entitiesMap, arrange } = ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Array.from(relations.categories.values()));
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $label', async ({ send_data, expected }) => {
        const queryParams = qs.stringify(send_data as any);
        const data = expected.entities.map((e) => ({
          id: e.id.value,
          name: e.name,
          is_active: e.is_active,
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
          created_at: e.created_at.toISOString(),
        }));
        const response = await request(nestApp.app.getHttpServer()).get(`/genres/?${queryParams}`).expect(200);
        expect(response.body).toStrictEqual({
          data: data,
          meta: expected.meta,
        });
      });
    });
  });
});
