import { RabbitmqConsumeErrorFilter } from '@/modules/rabbitmq-module/rabbitmq-consume-error/rabbitmq-consume-error.filter';

describe('RabbitmqConsumeErrorFilter', () => {
  it('should be defined', () => {
    expect(new RabbitmqConsumeErrorFilter()).toBeDefined();
  });
});
