import { ValueObject } from '@/core/shared/domain/value-object';

export interface IDomainEvent {
  aggregate_id: ValueObject;
  event_version: number;
  occurred_on: Date;

  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  event_name: string;
  event_version: number;
  occurred_on: Date;
  payload: T;
}
