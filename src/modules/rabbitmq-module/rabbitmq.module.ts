import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqMessageBroker } from '@/core/shared/infra/message-broker/rabbitmq-message-broker';
import { RabbitmqConsumeErrorFilter } from '@/modules/rabbitmq-module/rabbitmq-consume-error/rabbitmq-consume-error.filter';

type RabbitMQModuleOptions = {
  enableConsumers?: boolean;
};

export class RabbitmqModule {
  static forRoot(options: RabbitMQModuleOptions = {}): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => {
            return {
              uri: configService.get('RABBITMQ_URI') as string,
              registerHandlers: options.enableConsumers || configService.get('RABBITMQ_REGISTER_HANDLERS'),
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
                  createQueueIfNotExists: false,
                },
              ],
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqConsumeErrorFilter],
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
