import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';

export interface IMessageBroker {
  publishEvent(event: IDomainEvent): Promise<void>;
}
