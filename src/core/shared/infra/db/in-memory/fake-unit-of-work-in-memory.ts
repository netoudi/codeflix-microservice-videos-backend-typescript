import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';

export class FakeUnitOfWorkInMemory implements IUnitOfWork {
  private aggregateRoots: Set<AggregateRoot> = new Set<AggregateRoot>();

  start(): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  commit(): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  rollback(): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }

  getTransaction() {
    return;
  }

  addAggregateRoot(aggregateRoot: AggregateRoot): void {
    this.aggregateRoots.add(aggregateRoot);
  }

  getAggregateRoots(): AggregateRoot[] {
    return Array.from(this.aggregateRoots.values());
  }
}
