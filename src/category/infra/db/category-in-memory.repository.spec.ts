import { Category } from '@/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/category/infra/db/category-in-memory.repository';

describe('CategoryInMemoryRepository Unit Tests', () => {
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
  });

  it('should no filter items when filter object is null', async () => {
    const items = [new Category({ name: 'test' })];
    const filterSpy = jest.spyOn(items, 'filter');
    const itemsFiltered = await repository['applyFilter'](items, null);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items using filter parameter', async () => {
    const items = [new Category({ name: 'test' }), new Category({ name: 'TEST' }), new Category({ name: 'fake' })];

    const spyFilter = jest.spyOn(items, 'filter');

    const itemsFiltered = await repository['applyFilter'](items, 'TEST');
    expect(spyFilter).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should sort by createdAt when sort param is null', async () => {
    const createdAt = new Date();
    const items = [
      new Category({ name: 'test', createdAt }),
      new Category({ name: 'TEST', createdAt: new Date(createdAt.getTime() + 100) }),
      new Category({ name: 'fake', createdAt: new Date(createdAt.getTime() + 200) }),
    ];
    const itemsFiltered = await repository['applySort'](items, null, null);
    expect(itemsFiltered).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', async () => {
    const items = [new Category({ name: 'c' }), new Category({ name: 'b' }), new Category({ name: 'a' })];
    let itemsFiltered = await repository['applySort'](items, 'name', 'asc');
    expect(itemsFiltered).toStrictEqual([items[2], items[1], items[0]]);
    itemsFiltered = await repository['applySort'](items, 'name', 'desc');
    expect(itemsFiltered).toStrictEqual([items[0], items[1], items[2]]);
  });
});
