import { Category } from '@/category/domain/category.entity';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('Category Unit Tests', () => {
  let validateSpy: any;

  beforeEach(() => {
    validateSpy = jest.spyOn(Category, 'validate');
  });

  describe('constructor', () => {
    test('should create a categroy with default values', () => {
      const category = new Category({
        name: 'Movie',
      });
      expect(category.id).toBeInstanceOf(Uuid);
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
      expect(category.id).toBeInstanceOf(Uuid);
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
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Movie description');
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('id field', () => {
    const arrange = [{ id: null }, { id: undefined }, { id: new Uuid() }];
    test.each(arrange)('when id is %j', ({ id }) => {
      const category = new Category({
        id: id as any,
        name: 'Movie',
      });
      expect(category.id).toBeInstanceOf(Uuid);
      if (id instanceof Uuid) {
        expect(category.id).toBe(id);
      }
    });
  });

  describe('create command', () => {
    test('should create a categroy with default values', () => {
      const category = Category.create({
        name: 'Movie',
      });
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should create a category with all values', () => {
      const createdAt = new Date();
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
        createdAt,
      });
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Movie description');
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBe(createdAt);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should create a category with name and description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
      });
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBe('Movie description');
      expect(category.isActive).toBeTruthy();
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should create a category with name and isActive', () => {
      const category = Category.create({
        name: 'Movie',
        isActive: false,
      });
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.name).toBe('Movie');
      expect(category.description).toBeNull();
      expect(category.isActive).toBeFalsy();
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('actions', () => {
    test('should change name', () => {
      const category = Category.create({
        name: 'Movie',
      });
      category.changeName('name-updated');
      expect(category.name).toBe('name-updated');
      expect(validateSpy).toHaveBeenCalledTimes(2);
    });

    test('should change description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
      });
      category.changeDescription('description-updated');
      expect(category.description).toBe('description-updated');
      expect(validateSpy).toHaveBeenCalledTimes(2);
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

describe('Category Validator', () => {
  describe('create command', () => {
    test('should an invalid category with name property', () => {
      expect(() => Category.create({ name: null })).containsErrorMessages({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() => Category.create({ name: '' })).containsErrorMessages({
        name: ['name should not be empty'],
      });

      expect(() => Category.create({ name: 5 as any })).containsErrorMessages({
        name: ['name must be a string', 'name must be shorter than or equal to 255 characters'],
      });

      expect(() => Category.create({ name: 't'.repeat(256) })).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
    });

    test('should a invalid category using description property', () => {
      expect(() => Category.create({ name: 'Movie', description: 5 } as any)).containsErrorMessages({
        description: ['description must be a string'],
      });
    });

    test('should a invalid category using isActive property', () => {
      expect(() => Category.create({ name: 'Movie', isActive: 5 } as any)).containsErrorMessages({
        isActive: ['isActive must be a boolean value'],
      });
    });
  });

  describe('changeName method', () => {
    test('should an invalid category with name property', () => {
      const category = Category.create({ name: 'Movie' });
      expect(() => category.changeName(null)).containsErrorMessages({
        name: [
          'name should not be empty',
          'name must be a string',
          'name must be shorter than or equal to 255 characters',
        ],
      });

      expect(() => category.changeName('')).containsErrorMessages({
        name: ['name should not be empty'],
      });

      expect(() => category.changeName(5 as any)).containsErrorMessages({
        name: ['name must be a string', 'name must be shorter than or equal to 255 characters'],
      });

      expect(() => category.changeName('t'.repeat(256))).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
    });
  });

  describe('changeDescription method', () => {
    test('should a invalid category using description property', () => {
      const category = Category.create({ name: 'Movie' });
      expect(() => category.changeDescription(5 as any)).containsErrorMessages({
        description: ['description must be a string'],
      });
    });
  });
});
