import { CategoryId } from '@/core/category/domain/category.entity';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';

describe('Genre Unit Tests', () => {
  beforeEach(() => {
    Genre.prototype.validate = jest.fn().mockImplementation(Genre.prototype.validate);
  });

  test('constructor of genre', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map<string, CategoryId>([[categoryId.value, categoryId]]);
    let genre = new Genre({
      name: 'test',
      categories_id: categoriesId,
      is_active: undefined,
      created_at: undefined,
    });
    expect(genre.id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe('test');
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBe(true);
    expect(genre.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    genre = new Genre({
      name: 'test',
      categories_id: categoriesId,
      is_active: false,
      created_at,
    });
    expect(genre.id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe('test');
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBe(false);
    expect(genre.created_at).toBe(created_at);
  });

  describe('id field', () => {
    const categoryId = new CategoryId();
    const categories_id = new Map<string, CategoryId>([[categoryId.value, categoryId]]);
    const arrange = [
      { name: 'Movie', categories_id },
      { name: 'Movie', categories_id, id: null as any },
      { name: 'Movie', categories_id, id: undefined },
      { name: 'Movie', categories_id, id: new GenreId() },
    ];

    test.each(arrange)('when props is %j', (item) => {
      const genre = new Genre(item);
      expect(genre.id).toBeInstanceOf(GenreId);
      expect(genre.entityId).toBeInstanceOf(GenreId);
    });
  });

  describe('create command', () => {
    test('should create a genre', () => {
      const categoryId = new CategoryId();
      const categories_id = new Map<string, CategoryId>([[categoryId.value, categoryId]]);
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId],
      });
      expect(genre.id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categories_id).toEqual(categories_id);
      expect(genre.created_at).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

      const genre2 = Genre.create({
        name: 'test',
        categories_id: [categoryId],
        is_active: false,
      });
      expect(genre2.id).toBeInstanceOf(GenreId);
      expect(genre2.name).toBe('test');
      expect(genre2.categories_id).toEqual(categories_id);
      expect(genre2.is_active).toBe(false);
      expect(genre2.created_at).toBeInstanceOf(Date);
    });
  });

  describe('actions', () => {
    test('should change name', () => {
      const genre = Genre.create({
        name: 'test',
        categories_id: [new CategoryId()],
      });
      genre.changeName('test2');
      expect(genre.name).toBe('test2');
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
    });

    test('should add category id', () => {
      const categoryId1 = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId1],
      });
      genre.addCategoryId(categoryId1);
      expect(genre.categories_id.size).toBe(1);
      expect(genre.categories_id).toEqual(new Map([[categoryId1.value, categoryId1]]));
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);

      const categoryId2 = new CategoryId();
      genre.addCategoryId(categoryId2);
      expect(genre.categories_id.size).toBe(2);
      expect(genre.categories_id).toEqual(
        new Map([
          [categoryId1.value, categoryId1],
          [categoryId2.value, categoryId2],
        ]),
      );
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
    });

    test('should remove category id', () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId1, categoryId2],
      });
      expect(genre.categories_id.size).toBe(2);
      expect(genre.categories_id).toEqual(
        new Map([
          [categoryId1.value, categoryId1],
          [categoryId2.value, categoryId2],
        ]),
      );
      genre.removeCategoryId(categoryId2);
      expect(genre.categories_id.size).toBe(1);
      expect(genre.categories_id).toEqual(new Map([[categoryId1.value, categoryId1]]));
    });

    test('should sync categories id', () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId1],
      });
      genre.syncCategoriesId([]);
      expect(genre.categories_id.size).toBe(1);
      expect(genre.categories_id).toEqual(new Map([[categoryId1.value, categoryId1]]));
      genre.syncCategoriesId([categoryId1, categoryId2]);
      expect(genre.categories_id.size).toBe(2);
      expect(genre.categories_id).toEqual(
        new Map([
          [categoryId1.value, categoryId1],
          [categoryId2.value, categoryId2],
        ]),
      );
    });

    test('should active a genre', () => {
      const genre = Genre.create({
        name: 'test',
        categories_id: [],
        is_active: false,
      });
      genre.activate();
      expect(genre.is_active).toBe(true);
    });

    test('should disable a genre', () => {
      const genre = Genre.create({
        name: 'test',
        categories_id: [],
        is_active: true,
      });
      genre.deactivate();
      expect(genre.is_active).toBe(false);
    });

    test('entity to json', () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId1, categoryId2],
      });
      expect(genre.toJSON()).toStrictEqual({
        id: genre.id.value,
        name: genre.name,
        categories_id: [categoryId1.value, categoryId2.value],
        is_active: genre.is_active,
        created_at: genre.created_at,
      });
    });
  });
});

describe('Genre Validator', () => {
  describe('create command', () => {
    test('should an invalid genre with name property', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({
        name: 't'.repeat(256),
        categories_id: [categoryId],
      } as any);
      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName method', () => {
    it('should a invalid genre using name property', () => {
      const genre = Genre.fake().aGenre().build();
      genre.changeName('t'.repeat(256));
      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });
});
