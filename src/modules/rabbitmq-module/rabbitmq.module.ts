import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqMessageBroker } from '@/core/shared/infra/message-broker/rabbitmq-message-broker';

export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => {
            return {
              uri: configService.get('RABBITMQ_URI') as string,
              exchanges: [
                {
                  name: 'dlx.exchange',
                  type: 'topic',
                },
                {
                  name: 'direct.delayed',
                  type: 'x-delayed-message',
                  options: {
                    arguments: {
                      'x-delayed-type': 'direct',
                    },
                  },
                },
              ],
              queues: [
                {
                  name: 'dlx.queue',
                  exchange: 'dlx.exchange',
                  routingKey: '#',
                },
              ],
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [RabbitMQModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitmqMessageBroker(amqpConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
