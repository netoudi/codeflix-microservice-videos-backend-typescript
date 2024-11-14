import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage } from 'amqplib';
import { IIntegrationEvent } from '@/core/shared/domain/events/domain-event.interface';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { Config } from '@/core/shared/infra/config';
import { RabbitmqMessageBroker } from '@/core/shared/infra/message-broker/rabbitmq-message-broker';

class TestEvent implements IIntegrationEvent {
  event_name: string = TestEvent.name;
  event_version: number = 1;
  occurred_on: Date = new Date();
  payload: any;

  constructor(payload: any) {
    this.payload = payload;
  }
}

describe('RabbitmqMessageBroker Integration Tests', () => {
  let service: RabbitmqMessageBroker;
  let connection: AmqpConnection;

  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUri(),
      connectionInitOptions: { wait: true },
      logger: {
        debug: () => {},
        error: () => {},
        warn: () => {},
        log: () => {},
      },
    });
    await connection.init();
    const channel = connection.channel;
    await channel.assertExchange('test-exchange', 'direct', { durable: false });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');
    service = new RabbitmqMessageBroker(connection);
  });

  afterEach(async () => {
    try {
      await connection.managedConnection.close();
    } catch (e) {
      console.log(e);
    }
  });

  describe('publish', () => {
    it('should publish events to channel', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);

      const msg: ConsumeMessage | null = await new Promise((resolve) => {
        connection.channel.consume('test-queue', (msg) => {
          resolve(msg);
        });
      });

      const msgObj = msg ? JSON.parse(msg.content.toString()) : {};

      expect(msgObj).toEqual({
        event_name: TestEvent.name,
        event_version: 1,
        occurred_on: event.occurred_on.toISOString(),
        payload: event.payload,
      });
    });
  });
});
