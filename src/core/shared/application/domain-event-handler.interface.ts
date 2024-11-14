import { IDomainEvent, IIntegrationEvent } from '@/core/shared/domain/events/domain-event.interface';

export interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>;
}

export interface IIntegrationEventHandler {
  handle(event: IIntegrationEvent): Promise<void>;
}
