import { ValueObject } from '@/shared/domain/value-object';

export abstract class Entity {
  abstract get entityId(): ValueObject;
  abstract toJSON(): any;
}
