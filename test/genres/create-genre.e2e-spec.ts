import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { GenreId } from '@/core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@/core/genre/domain/genre.repository';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { GenresController } from '@/modules/genres-module/genres.controller';
import { GENRE_PROVIDERS } from '@/modules/genres-module/genres.providers';
import { CreateGenreFixture } from '@/modules/genres-module/testing/genre-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('GenresController (e2e)', () => {
  describe('/genres (POST)', () => {
    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = CreateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/genres')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationErrors = CreateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/genres')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a genre', () => {
      const app = startApp();
      const arrange = CreateGenreFixture.arrangeForSave();
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;
      beforeEach(async () => {
        genreRepo = app.app.get<IGenreRepository>(GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide);
        categoryRepo = app.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
      });
      test.each(arrange)('when body is $send_data', async ({ send_data, expected, relations }) => {
        await categoryRepo.bulkInsert(relations.categories);
        const res = await request(app.app.getHttpServer()).post('/genres').send(send_data).expect(201);
        const keyInResponse = CreateGenreFixture.keysInResponse;
        expect(Object.keys(res.body)).toStrictEqual(['data']);
        expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
        const id = res.body.data.id;
        const genreCreated = await genreRepo.findById(new GenreId(id));
        const presenter = GenresController.serialize(GenreOutputMapper.toOutput(genreCreated!, relations.categories));
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
