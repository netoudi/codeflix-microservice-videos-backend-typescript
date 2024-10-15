import EventEmitter2 from 'eventemitter2';
import { ApplicationService } from '@/core/shared/application/application.service';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { DomainEventMediator } from '@/core/shared/domain/events/domain-event-mediator';
import { ValueObject } from '@/core/shared/domain/value-object';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';

class StubAggregateRoot extends AggregateRoot {
  get entityId(): ValueObject {
    throw new Error('Method not implemented.');
  }

  toJSON() {
    throw new Error('Method not implemented.');
  }
}

describe('ApplicationService Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;
  let domainEventMediator: DomainEventMediator;
  let applicationService: ApplicationService;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();
    domainEventMediator = new DomainEventMediator(new EventEmitter2());
    applicationService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should call the start method of unit of work', () => {
      const startSpy = jest.spyOn(uow, 'start');
      applicationService.start();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should call the publish method of domain event mediator and the commit method', async () => {
      const aggregateRoot = new StubAggregateRoot();
      uow.addAggregateRoot(aggregateRoot);
      const publishSpy = jest.spyOn(domainEventMediator, 'publish');
      const commitSpy = jest.spyOn(uow, 'commit');
      await applicationService.finish();
      expect(publishSpy).toHaveBeenCalledWith(aggregateRoot);
      expect(commitSpy).toHaveBeenCalled();
    });
  });

  describe('fail', () => {
    it('should call the rollback method of unit of work', () => {
      const rollbackSpy = jest.spyOn(uow, 'rollback');
      applicationService.fail();
      expect(rollbackSpy).toHaveBeenCalled();
    });
  });

  describe('run', () => {
    it('should start, execute the callback, finish and return the result', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const spyStart = jest.spyOn(applicationService, 'start');
      const spyFinish = jest.spyOn(applicationService, 'finish');

      const result = await applicationService.run(callback);

      expect(spyStart).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(spyFinish).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback and throw the error if the callback throws an error', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('test-error'));
      const spyFail = jest.spyOn(applicationService, 'fail');
      await expect(applicationService.run(callback)).rejects.toThrow('test-error');
      expect(spyFail).toHaveBeenCalled();
    });
  });
});