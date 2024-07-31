import { Sequelize } from 'sequelize-typescript';
import { Category } from '@/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('CategorySequelizeRepository Integration Tests', () => {
  let sequelize;
  let repository: CategorySequelizeRepository;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [CategoryModel],
      logging: false,
    });
    await sequelize.sync({ force: true });
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  it('should insert a new category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const entity = await repository.findById(category.id);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());
  });

  it('should find a category by id', async () => {
    let entity = await repository.findById(new Uuid());
    expect(entity).toBeNull();
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    entity = await repository.findById(category.id);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());
  });

  it('should return all categories', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const categories = await repository.findAll();
    expect(categories).toHaveLength(1);
    expect(JSON.stringify(categories)).toStrictEqual(JSON.stringify([category]));
  });

  it('should throw error on update when a category is not found', async () => {
    const category = Category.fake().aCategory().build();
    await expect(repository.update(category)).rejects.toThrow(new NotFoundError(category.id, Category));
  });

  it('should update a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    category.changeName('name-updated');
    await repository.update(category);
    const entity = await repository.findById(category.id);
    expect(entity.toJSON()).toStrictEqual(category.toJSON());
    expect(entity.name).toBe('name-updated');
  });

  it('should throw error on delete when a category is not found', async () => {
    const category = Category.fake().aCategory().build();
    await expect(repository.delete(category.id)).rejects.toThrow(new NotFoundError(category.id, Category));
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await repository.delete(category.id);
    await expect(repository.findById(category.id)).resolves.toBeNull();
  });
});
