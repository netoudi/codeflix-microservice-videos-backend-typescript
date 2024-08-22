import { Category } from '@/category/domain/category.entity';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('Category Unit Tests', () => {
  beforeEach(() => {
    Category.prototype.validate = jest.fn().mockImplementation(Category.prototype.validate);
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
      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBeFalsy();
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
      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBeFalsy();
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
      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBeFalsy();
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
      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBeFalsy();
    });
  });

  describe('actions', () => {
    test('should change name', () => {
      const category = Category.create({
        name: 'Movie',
      });
      category.changeName('name-updated');
      expect(category.name).toBe('name-updated');
      expect(Category.prototype.validate).toHaveBeenCalledTimes(2);
      expect(category.notification.hasErrors()).toBeFalsy();
    });

    test('should change description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
      });
      category.changeDescription('description-updated');
      expect(category.description).toBe('description-updated');
      expect(Category.prototype.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBeFalsy();
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
      const category = Category.create({ name: 'x'.repeat(256) });
      expect(category.notification.hasErrors()).toBeTruthy();
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName method', () => {
    test('should an invalid category with name property', () => {
      const category = Category.create({ name: 'Movie' });
      category.changeName('x'.repeat(256));
      expect(category.notification.hasErrors()).toBeTruthy();
      expect(category.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
