import { Category } from '@/domain/category.entity';

describe('Category Unit Tests', () => {
  describe('constructor', () => {
    test('should create a categroy with default values', () => {
      const category = new Category({
        name: 'Movie',
      });
      expect(category.id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    test('should create a category with all values', () => {
      const createdAt = new Date();
      const category = new Category({
        name: 'Movie',
        description: 'Movie description',
        createdAt,
      });
      expect(category.id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Movie description');
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBe(createdAt);
    });

    test('constructor with name and description', () => {
      const category = new Category({
        name: 'Movie',
        description: 'Movie description',
      });
      expect(category.id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Movie description');
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);
    });
  });
});
