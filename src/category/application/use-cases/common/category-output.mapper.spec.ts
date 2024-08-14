import { CategoryOutputMapper } from '@/category/application/use-cases/common/category-output.mapper';
import { Category } from '@/category/domain/category.entity';

describe('CategoryOutputMapper Unit Tests', () => {
  it('should convert a category in output', () => {
    const category = Category.fake().aCategory().build();
    const output = CategoryOutputMapper.toOutput(category);
    expect(output).toStrictEqual({
      id: category.id.value,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });
  });
});
