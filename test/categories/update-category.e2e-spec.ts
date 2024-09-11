import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CategoryOutputMapper } from '@/core/category/application/use-cases/common/category-output.mapper';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import { UpdateCategoryFixture } from '@/modules/categories-module/testing/category-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICategoryRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  describe('/categories/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const faker = Category.fake().aCategory();
      const arrange = [
        {
          id: 'b11c9be1-b619-4ef5-be1b-a1cd9ef265b7',
          send_data: { name: faker.name },
          expected: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Entity Category with id b11c9be1-b619-4ef5-be1b-a1cd9ef265b7 not found',
          },
        },
        {
          id: 'fake-id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: 'Validation failed (uuid is expected)',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, send_data, expected }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${id}`)
          .send(send_data)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/b11c9be1-b619-4ef5-be1b-a1cd9ef265b7`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const invalidRequest = UpdateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);
        return request(appHelper.app.getHttpServer())
          .patch(`/categories/${category.id.value}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a category', () => {
      const arrange = UpdateCategoryFixture.arrangeForUpdate();

      test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);
        const response = await request(appHelper.app.getHttpServer())
          .patch(`/categories/${category.id.value}`)
          .send(send_data)
          .expect(200);
        const keysInResponse = ['id', 'name', 'description', 'is_active', 'created_at'];
        expect(Object.keys(response.body)).toStrictEqual(['data']);
        expect(Object.keys(response.body.data)).toStrictEqual(keysInResponse);
        const id = response.body.data.id;
        const categoryUpdated = await repository.findById(new Uuid(id));
        const presenter = CategoriesController.serialize(CategoryOutputMapper.toOutput(categoryUpdated));
        const serialized = instanceToPlain(presenter);
        expect(response.body.data).toStrictEqual(serialized);
        expect(response.body.data).toStrictEqual({
          id: serialized.id,
          name: expected.name ?? categoryUpdated.name,
          description: 'description' in expected ? expected.description : categoryUpdated.description,
          is_active: expected.is_active ?? categoryUpdated.is_active,
          created_at: serialized.created_at,
        });
      });
    });
  });
});
