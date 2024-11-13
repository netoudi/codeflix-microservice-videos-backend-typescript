import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { IMessageBroker } from '@/core/shared/application/message-broker.interface';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '@/core/shared/infra/message-broker/events-message-broker-config';

export class RabbitmqMessageBroker implements IMessageBroker {
  constructor(private conn: AmqpConnection) {}

  async publishEvent(event: IDomainEvent): Promise<void> {
    const config = EVENTS_MESSAGE_BROKER_CONFIG[event.constructor.name];
    await this.conn.publish(config.exchange, config.routing_key, event);
  }
}