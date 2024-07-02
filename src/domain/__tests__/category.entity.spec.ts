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

    test('should create a category with name and description', () => {
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

  describe('create command', () => {
    test('should create a categroy with default values', () => {
      const category = Category.create({
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
      const category = Category.create({
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

    test('should create a category with name and description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
      });
      expect(category.id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Movie description');
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    test('should create a category with name and isActive', () => {
      const category = Category.create({
        name: 'Movie',
        isActive: false,
      });
      expect(category.id).toBeUndefined();
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBeFalsy();
      expect(category.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('actions', () => {
    test('should change name', () => {
      const category = Category.create({
        name: 'Movie',
      });
      category.changeName('name-updated');
      expect(category.name).toBe('name-updated');
    });

    test('should change description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
      });
      category.changeDescription('description-updated');
      expect(category.description).toBe('description-updated');
    });

    test('should active a category', () => {
      const category = Category.create({
        name: 'Movie',
        isActive: false,
      });
      category.activate();
      expect(category.isActive).toBe(true);
    });

    test('should disable a category', () => {
      const category = Category.create({
        name: 'Movie',
        isActive: true,
      });
      category.deactivate();
      expect(category.isActive).toBe(false);
    });
  });
});
