import { Entity } from '@/shared/domain/entity';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { IRepository, ISearchableRepository } from '@/shared/domain/repository/repository-interface';
import { SearchParams, SortDirection } from '@/shared/domain/repository/search-params';
import { SearchResult } from '@/shared/domain/repository/search-result';
import { ValueObject } from '@/shared/domain/value-object';

export abstract class InMemoryRepository<E extends Entity, EntityId extends ValueObject>
  implements IRepository<E, EntityId>
{
  public items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async update(entity: E): Promise<void> {
    const indexFound = this.findIndexOrFail(entity);
    this.items[indexFound] = entity;
  }

  async delete(entityId: EntityId): Promise<void> {
    const indexFound = this.findIndexOrFail(entityId);
    this.items.splice(indexFound, 1);
  }

  async findById(entityId: EntityId): Promise<E | null> {
    return this.items.find((item) => item.entityId.equals(entityId)) ?? null;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  private findIndexOrFail(value: E | EntityId): number {
    const entityId = value instanceof Entity ? value.entityId : value;
    const indexFound = this.items.findIndex((item) => item.entityId.equals(entityId));
    if (indexFound < 0) throw new NotFoundError(entityId, this.getEntity());
    return indexFound;
  }

  abstract getEntity(): new (...args: any[]) => E;
}

export abstract class InMemorySearchableRepository<E extends Entity, EntityId extends ValueObject, Filter = string>
  extends InMemoryRepository<E, EntityId>
  implements ISearchableRepository<E, EntityId, Filter>
{
  sortableFields: string[];

  async search(props: SearchParams<Filter>): Promise<SearchResult<Entity>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = this.applySort(itemsFiltered, props.sort, props.sortDir);
    const itemsPaginated = this.applyPaginate(itemsSorted, props.page, props.perPage);
    return Promise.resolve(
      new SearchResult({
        items: itemsPaginated,
        total: itemsFiltered.length,
        currentPage: props.page,
        perPage: props.perPage,
      }),
    );
  }

  protected applySort(
    items: E[],
    sort: string | null,
    sortDir: SortDirection | null,
    customGetter?: (sort: string, item: E) => any,
  ): E[] {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }
    return [...items].sort((a, b) => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const aValue = customGetter ? customGetter(sort, a) : a[sort];
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const bValue = customGetter ? customGetter(sort, b) : b[sort];
      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  protected abstract applyFilter(items: E[], filter: Filter | null): Promise<E[]>;

  protected applyPaginate(items: E[], page: SearchParams['page'], perPage: SearchParams['perPage']): E[] {
    const start = (page - 1) * perPage;
    const limit = start + perPage;
    return items.slice(start, limit);
  }
}
