import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreModelMapper } from '@/core/genre/infra/db/sequelize/genre-model.mapper';
import { GenreModel, GenreCategoryModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { LoadEntityError } from '@/core/shared/domain/validators/validation.error';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('GenreModelMapper Integration Tests', () => {
  let categoryRepo: ICategoryRepository;

  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it('should throws error when genre is invalid', () => {
    const arrange = [
      {
        makeModel: () => {
          //@ts-expect-error - an invalid genre
          return GenreModel.build({
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 't'.repeat(256),
            categories_id: [],
          });
        },
        expectedErrors: [
          {
            categories_id: ['categories_id should not be empty'],
          },
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    for (const item of arrange) {
      try {
        GenreModelMapper.toEntity(item.makeModel());
        fail('The genre is valid, but it needs throws a LoadEntityError');
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.errors).toMatchObject(item.expectedErrors);
      }
    }
  });

  it('should convert a genre model to a genre entity', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const created_at = new Date();
    const model = await GenreModel.create(
      {
        id: '5490020a-e866-4229-9adc-aa44b83234c4',
        name: 'some value',
        categories_id: [
          GenreCategoryModel.build({
            genre_id: '5490020a-e866-4229-9adc-aa44b83234c4',
            category_id: category1.id.value,
          }),
          GenreCategoryModel.build({
            genre_id: '5490020a-e866-4229-9adc-aa44b83234c4',
            category_id: category2.id.value,
          }),
        ],
        is_active: true,
        created_at,
      },
      { include: ['categories_id'] },
    );
    const entity = GenreModelMapper.toEntity(model);
    expect(entity.toJSON()).toEqual(
      new Genre({
        id: new GenreId('5490020a-e866-4229-9adc-aa44b83234c4'),
        name: 'some value',
        categories_id: new Map([
          [category1.id.value, category1.id],
          [category2.id.value, category2.id],
        ]),
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });

  it('should convert a genre entity to a genre model', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    const created_at = new Date();
    const entity = new Genre({
      id: new GenreId('5490020a-e866-4229-9adc-aa44b83234c4'),
      name: 'some value',
      categories_id: new Map([
        [category1.id.value, category1.id],
        [category2.id.value, category2.id],
      ]),
      is_active: true,
      created_at,
    });
    const model = GenreModel.build(
      {
        id: '5490020a-e866-4229-9adc-aa44b83234c4',
        name: 'some value',
        categories_id: [
          GenreCategoryModel.build({
            genre_id: '5490020a-e866-4229-9adc-aa44b83234c4',
            category_id: category1.id.value,
          }),
          GenreCategoryModel.build({
            genre_id: '5490020a-e866-4229-9adc-aa44b83234c4',
            category_id: category2.id.value,
          }),
        ],
        is_active: true,
        created_at,
      },
      { include: ['categories_id'] },
    );
    const result = GenreModelMapper.toModel(entity);
    expect(result.toJSON()).toEqual(model.toJSON());
  });
});
