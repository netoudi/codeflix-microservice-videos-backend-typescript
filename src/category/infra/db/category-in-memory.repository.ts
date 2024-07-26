import { Category } from '@/category/domain/category.entity';
import { ICategoryRepository } from '@/category/domain/category.repository';
import { SortDirection } from '@/shared/domain/repository/search-params';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '@/shared/infra/db/in-memory/in-memory.repository';

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category, Uuid>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'createdAt'];

  protected async applyFilter(items: Category[], filter: string): Promise<Category[]> {
    if (!filter) return items;
    return items.filter((i) => {
      return i.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  protected applySort(items: Category[], sort: string | null, sortDir: SortDirection | null): Category[] {
    return sort ? super.applySort(items, sort, sortDir) : super.applySort(items, 'createdAt', 'desc');
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
