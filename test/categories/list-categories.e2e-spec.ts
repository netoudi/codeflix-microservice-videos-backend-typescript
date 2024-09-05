import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CategoryOutputMapper } from '@/core/category/application/use-cases/common/category-output.mapper';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { ListCategoriesFixture } from '@/modules/categories-module/testing/category-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICategoryRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  describe('/categories (GET)', () => {
    describe('should return categories sorted by created_at when request query is empty', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when query params is $send_data', ({ send_data, expected }) => {
        const queryParams = new URLSearchParams(send_data as any).toString();
        return request(appHelper.app.getHttpServer())
          .get(`/categories?${queryParams}`)
          .expect(200)
          .expect({
            data: expected.entities.map((e) => {
              return instanceToPlain(CategoriesController.serialize(CategoryOutputMapper.toOutput(e)));
            }),
            meta: expected.meta,
          });
      });
    });

    describe('should return categories using paginate, filter and sort', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when query params is $send_data', ({ send_data, expected }) => {
        const queryParams = new URLSearchParams(send_data as any).toString();
        return request(appHelper.app.getHttpServer())
          .get(`/categories?${queryParams}`)
          .expect(200)
          .expect({
            data: expected.entities.map((e) => {
              return instanceToPlain(CategoriesController.serialize(CategoryOutputMapper.toOutput(e)));
            }),
            meta: expected.meta,
          });
      });
    });
  });
});
