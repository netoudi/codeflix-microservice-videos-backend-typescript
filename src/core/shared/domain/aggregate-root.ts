import EventEmitter2 from 'eventemitter2';
import { Entity } from '@/core/shared/domain/entity';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';

export abstract class AggregateRoot extends Entity {
  events: Set<IDomainEvent> = new Set<IDomainEvent>();
  dispatchedEvents: Set<IDomainEvent> = new Set<IDomainEvent>();
  localMediator = new EventEmitter2();

  applyEvent(event: IDomainEvent) {
    this.events.add(event);
    this.localMediator.emit(event.constructor.name, event);
  }

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    this.localMediator.on(event, handler);
  }

  markEventAsDispatched(event: IDomainEvent) {
    this.dispatchedEvents.add(event);
  }

  getUncommittedEvents(): IDomainEvent[] {
    return Array.from(this.events).filter((e) => !this.dispatchedEvents.has(e));
  }

  clearEvents() {
    this.events.clear();
    this.dispatchedEvents.clear();
  }
}
