import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CategoryOutputMapper } from '@/core/category/application/use-cases/common/category-output.mapper';
import { CategoryId } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { CreateCategoryFixture } from '@/modules/categories-module/testing/category-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICategoryRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  describe('/categories (POST)', () => {
    describe('should return a response error with 422 status code when request body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const invalidRequest = CreateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
        const response = await request(appHelper.app.getHttpServer()).post('/categories').send(send_data).expect(201);
        const keysInResponse = ['id', 'name', 'description', 'is_active', 'created_at'];
        expect(Object.keys(response.body)).toStrictEqual(['data']);
        expect(Object.keys(response.body.data)).toStrictEqual(keysInResponse);
        const id = response.body.data.id;
        const categoryCreated = await repository.findById(new CategoryId(id));
        const presenter = CategoriesController.serialize(CategoryOutputMapper.toOutput(categoryCreated!));
        const serialized = instanceToPlain(presenter);
        expect(response.body.data).toStrictEqual({
          id: serialized.id,
          name: expected.name,
          description: expected.description,
          is_active: expected.is_active,
          created_at: serialized.created_at,
        });
      });
    });
  });
});
