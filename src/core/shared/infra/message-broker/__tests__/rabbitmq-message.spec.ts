import { ChannelWrapper } from 'amqp-connection-manager';
import { IDomainEvent } from '@/core/shared/domain/events/domain-event.interface';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '@/core/shared/infra/message-broker/events-message-broker-config';
import { RabbitmqMessageBroker } from '@/core/shared/infra/message-broker/rabbitmq-message-broker';

class TestEvent implements IDomainEvent {
  event_version: number = 1;
  occurred_on: Date = new Date();

  constructor(readonly aggregate_id: Uuid) {}
}

describe('RabbitmqMessageBroker Unit Tests', () => {
  let service: RabbitmqMessageBroker;
  let connection: ChannelWrapper;

  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;
    service = new RabbitmqMessageBroker(connection as any);
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);

      expect(connection.publish).toHaveBeenCalledWith(
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].exchange,
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].routing_key,
        event,
      );
    });
  });
});
