import { AggregateRoot } from '@/core/shared/domain/aggregate-root';

export interface IUnitOfWork {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
  getTransaction(): any;
  addAggregateRoot(aggregateRoot: AggregateRoot): void;
  getAggregateRoots(): AggregateRoot[];
}
