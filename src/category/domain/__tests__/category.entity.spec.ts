import { Category } from '@/category/domain/category.entity';
import { EntityValidationError } from '@/shared/domain/validators/entity-validation.error';
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
  test('field name', () => {
    expect(() => {
      Category.create({
        name: null,
      });
    }).toThrow(
      new EntityValidationError({
        name: ['name is'],
      }),
    );
  });
});
