import { AggregateRoot } from '@/core/shared/domain/aggregate-root';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';
import { ValueObject } from '@/core/shared/domain/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

class StubEvent implements IDomainEvent {
  event_version: number = 1;
  occurred_on: Date = new Date();

  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {}
}

export class StubAggregateRoot extends AggregateRoot {
  aggregate_id: Uuid;
  name: string;
  field1: string;

  constructor(id: Uuid, name: string) {
    super();
    this.aggregate_id = id;
    this.name = name;
    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  operation() {
    this.name = this.name.toUpperCase();
    this.applyEvent(new StubEvent(this.aggregate_id, this.name));
  }

  onStubEvent(event: StubEvent) {
    this.field1 = event.name;
  }

  get entityId(): ValueObject {
    return this.aggregate_id;
  }

  toJSON() {
    return {
      id: this.aggregate_id,
      name: this.name,
    };
  }
}

describe('AggregateRoot Unit Tests', () => {
  test('dispatch events', () => {
    const aggregate = new StubAggregateRoot(new Uuid(), 'test name');
    aggregate.operation();
    expect(aggregate.field1).toBe('TEST NAME');
  });
});
