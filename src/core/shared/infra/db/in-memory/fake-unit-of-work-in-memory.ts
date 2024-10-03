import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';

export class FakeUnitOfWorkInMemory implements IUnitOfWork {
  start(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  commit(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  rollback(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }

  getTransaction() {
    throw new Error('Method not implemented.');
  }
}
