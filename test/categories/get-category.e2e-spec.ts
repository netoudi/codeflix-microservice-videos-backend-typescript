import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CategoryOutputMapper } from '@/core/category/application/use-cases/common/category-output.mapper';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICategoryRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  describe('/categories/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: 'b11c9be1-b619-4ef5-be1b-a1cd9ef265b7',
          expected: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Entity Category with id b11c9be1-b619-4ef5-be1b-a1cd9ef265b7 not found',
          },
        },
        {
          id: 'fake-id',
          expected: {
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: 'Validation failed (uuid is expected)',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a category', async () => {
      const category = Category.fake().aCategory().build();
      await repository.insert(category);
      const response = await request(appHelper.app.getHttpServer()).get(`/categories/${category.id.value}`).expect(200);
      const keysInResponse = ['id', 'name', 'description', 'is_active', 'created_at'];
      expect(Object.keys(response.body)).toStrictEqual(['data']);
      expect(Object.keys(response.body.data)).toStrictEqual(keysInResponse);
      const presenter = CategoriesController.serialize(CategoryOutputMapper.toOutput(category));
      const serialized = instanceToPlain(presenter);
      expect(response.body.data).toStrictEqual(serialized);
    });
  });
});
