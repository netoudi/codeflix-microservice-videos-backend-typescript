import { Category } from '@/core/category/domain/category.entity';
import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { Genre } from '@/core/genre/domain/genre.aggregate';

describe('GenreOutputMapper Unit Tests', () => {
  it('should convert a genre in output', () => {
    const categories = Category.fake().theCategories(2).build();
    const created_at = new Date();
    const entity = Genre.fake()
      .aGenre()
      .withName('test')
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .withCreatedAt(created_at)
      .build();
    const output = GenreOutputMapper.toOutput(entity, categories);
    expect(output).toStrictEqual({
      id: entity.id.value,
      name: 'test',
      categories: [
        {
          id: categories[0].id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[1].id.value,
          name: categories[1].name,
          created_at: categories[1].created_at,
        },
      ],
      categories_id: [categories[0].id.value, categories[1].id.value],
      is_active: entity.is_active,
      created_at,
    });
  });
});
