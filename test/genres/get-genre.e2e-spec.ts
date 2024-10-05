import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GenresController } from '@/modules/genres-module/genres.controller';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { GetGenreFixture } from '@/modules/genres-module/testing/genre-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('GenresController (e2e)', () => {
  const nestApp = startApp();
  describe('/genres/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message: 'Entity Genre with id 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
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
        return request(nestApp.app.getHttpServer()).get(`/genres/${id}`).expect(expected.statusCode).expect(expected);
      });
    });

    it('should return a genre ', async () => {
      const genreRepo = nestApp.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
      const categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const categories = Category.fake().theCategories(3).build();
      await categoryRepo.bulkInsert(categories);
      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .build();
      await genreRepo.insert(genre);

      const res = await request(nestApp.app.getHttpServer()).get(`/genres/${genre.id.value}`).expect(200);
      const keyInResponse = GetGenreFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = GenresController.serialize(GenreOutputMapper.toOutput(genre, categories));
      const serialized = instanceToPlain(presenter);
      serialized.categories_id = expect.arrayContaining(serialized.categories_id);
      serialized.categories = expect.arrayContaining(
        serialized.categories.map((category) => ({
          id: category.id,
          name: category.name,
          created_at: category.created_at,
        })),
      );
      expect(res.body.data).toEqual(serialized);
    });
  });
});
