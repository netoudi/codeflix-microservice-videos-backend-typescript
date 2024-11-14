import { ValueObject } from '@/core/shared/domain/value-object';

export interface IDomainEvent {
  aggregate_id: ValueObject;
  event_version: number;
  occurred_on: Date;
}
