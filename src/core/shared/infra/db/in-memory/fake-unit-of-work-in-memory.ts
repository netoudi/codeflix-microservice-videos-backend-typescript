import { IUnitOfWork } from '@/core/shared/domain/repository/unit-of-work.interface';

export class FakeUnitOfWorkInMemory implements IUnitOfWork {
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
}
