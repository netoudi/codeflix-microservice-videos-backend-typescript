import request from 'supertest';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
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
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const response = await request(appHelper.app.getHttpServer()).post('/categories').send(send_data).expect(201);
      const keysInResponse = CreateCategoryFixture.keysInResponse;
      console.log(response.body);
      expect(Object.keys(response.body)).toStrictEqual(['data']);
    });
  });
});
