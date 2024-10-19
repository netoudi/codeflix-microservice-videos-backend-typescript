import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';

export interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>;
}
