import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { CreateCategoryFixture } from '@/modules/categories-module/testing/category-fixture';
import { applyGlobalConfig } from '@/modules/global-config';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalConfig(app);
    await app.init();
    repository = app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('/categories (POST)', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const response = await request(app.getHttpServer()).post('/categories').send(send_data).expect(201);
      const keysInResponse = CreateCategoryFixture.keysInResponse;
      console.log(response.body);
      expect(Object.keys(response.body)).toStrictEqual(['data']);
    });
  });
});
