import { Sequelize } from 'sequelize-typescript';
import { Category } from '@/category/domain/category.entity';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';

describe('CategoryModel Unit Test', () => {
  test('should create a category', async () => {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [CategoryModel],
    });
    await sequelize.sync({ force: true });

    const category = Category.fake().aCategory().build();

    await CategoryModel.create({
      id: category.id.value,
      name: category.name,
      description: category.description,
      is_active: category.isActive,
      created_at: category.createdAt,
    });
  });
});
