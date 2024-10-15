import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { DomainEventMediator } from '@/core/shared/domain/events/domain-event-mediator';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;

  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
    this.event_version = 1;
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
});
