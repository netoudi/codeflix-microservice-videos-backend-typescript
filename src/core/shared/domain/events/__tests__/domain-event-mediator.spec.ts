import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { DomainEventMediator } from '@/core/shared/domain/events/domain-event-mediator';
import { IDomainEvent, IIntegrationEvent } from '@/core/shared/domain/events/domain-event.interface';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

class StubEvent implements IDomainEvent {
  aggregate_id: ValueObject;
  event_version: number;
  occurred_on: Date;
  name: string;

  constructor(aggregate_id: ValueObject, name: string) {
    this.aggregate_id = aggregate_id;
    this.event_version = 1;
    this.occurred_on = new Date();
    this.name = name;
  }

  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  event_name: string;
  event_version: number;
  occurred_on: Date;
  payload: any;

  constructor(event: IDomainEvent) {
    this.event_name = this.constructor.name;
    this.event_version = event.event_version;
    this.occurred_on = event.occurred_on;
    this.payload = event;
  }
}

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  get entityId(): ValueObject {
    return this.id;
  }

  action(name: string) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

describe('DomainEventMediator Unit Test', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmitter);
  });

  it('should publish handler', async () => {
    expect.assertions(1);
    mediator.register(StubEvent.name, (event: StubEvent) => {
      expect(event.name).toBe('test');
    });
    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publish(aggregate);
    await mediator.publish(aggregate);
  });

  it('should not publish integration event', async () => {
    expect.assertions(1);
    const spyRegister = jest.spyOn(mediator, 'register');
    const aggregate = new StubAggregate();
    aggregate.action('test');
    Array.from(aggregate.events)[0].getIntegrationEvent = undefined;
    await mediator.publishIntegrationEvents(aggregate);
    expect(spyRegister).not.toHaveBeenCalled();
  });

  it('should publish integration event', async () => {
    expect.assertions(4);
    mediator.register(StubIntegrationEvent.name, async (event: StubIntegrationEvent) => {
      expect(event.event_name).toBe(StubIntegrationEvent.name);
      expect(event.event_version).toBe(1);
      expect(event.occurred_on).toBeInstanceOf(Date);
      expect(event.payload.name).toBe('test');
    });
    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publishIntegrationEvents(aggregate);
  });
});
