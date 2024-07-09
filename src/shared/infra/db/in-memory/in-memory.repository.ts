import { Entity } from '@/shared/domain/entity';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { IRepository } from '@/shared/domain/repository/repository-interface';
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

  async delete(entity: E): Promise<void> {
    const indexFound = this.findIndexOrFail(entity);
    this.items.splice(indexFound, 1);
  }

  async findById(id: EntityId): Promise<E | null> {
    return this.items.find((item) => item.entityId.equals(id)) ?? null;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  private findIndexOrFail(entity: E): number {
    const indexFound = this.items.findIndex((item) => item.entityId.equals(entity.entityId));
    if (indexFound < 0) throw new NotFoundError(entity.entityId, this.getEntity());
    return indexFound;
  }

  abstract getEntity(): new (...args: any[]) => E;
}
