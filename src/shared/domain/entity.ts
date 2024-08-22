import { Notification } from '@/shared/domain/validators/notification';
import { ValueObject } from '@/shared/domain/value-object';

export abstract class Entity {
  notification: Notification = new Notification();

  abstract get entityId(): ValueObject;
  abstract toJSON(): any;
}
