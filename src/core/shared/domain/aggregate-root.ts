import { Entity } from '@/core/shared/domain/entity';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';

export abstract class AggregateRoot extends Entity {
  applyEvent(event: IDomainEvent) {
    //
  }

  registerHandler(event: sgring, handler: (event: IDomainEvent) => void) {
    //
  }
}
