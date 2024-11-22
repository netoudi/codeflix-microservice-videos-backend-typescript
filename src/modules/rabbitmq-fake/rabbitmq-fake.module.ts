import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { RabbitmqFakeController } from '@/modules/rabbitmq-fake/rabbitmq-fake.controller';
import { RabbitmqFakeService } from '@/modules/rabbitmq-fake/rabbitmq-fake.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://admin:admin@host.docker.internal:5672',
    }),
  ],
  controllers: [RabbitmqFakeController],
  providers: [RabbitmqFakeService],
})
export class RabbitmqFakeModule {}
