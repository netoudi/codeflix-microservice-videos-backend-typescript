import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitmqFakeService {
  @RabbitSubscribe({
    exchange: 'amq.direct',
    queue: 'fake-queue',
    routingKey: 'fake-key',
  })
  handle(msg: any) {
    console.log(msg);
  }
}
