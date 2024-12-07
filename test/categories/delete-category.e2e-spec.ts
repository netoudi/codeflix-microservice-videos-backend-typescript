import request from 'supertest';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICategoryRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  describe('/categories/:id (DELETE)', () => {
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
          .delete(`/categories/${id}`)
          .authenticate(appHelper.app)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a category with response status 204', async () => {
      const category = Category.fake().aCategory().build();
      await repository.insert(category);
      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.id.value}`)
        .authenticate(appHelper.app)
        .expect(204);
      await expect(repository.findById(category.id)).resolves.toBeNull();
    });
  });
});
