import { Nack } from '@golevelup/nestjs-rabbitmq';
import { ArgumentsHost, Catch, ExceptionFilter, UnprocessableEntityException } from '@nestjs/common';
import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';

@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  static readonly RETRY_COUNT_HEADER = 'x-retry-count';
  static readonly MAX_RETRIES = 3;
  static readonly NON_RETRIABLE_ERRORS = [NotFoundError, EntityValidationError, UnprocessableEntityException];

  catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') return;

    const hasRetriableError = RabbitmqConsumeErrorFilter.NON_RETRIABLE_ERRORS.some(
      (error) => exception instanceof error,
    );

    if (hasRetriableError) {
      return new Nack(false);
    }

    const ctx = host.switchToRpc();
    const message: ConsumeMessage = ctx.getContext();
    if (this.shouldRetry(message.properties.headers)) {
    } else {
      return new Nack(false);
    }
  }

  private shouldRetry(messageHeaders: MessagePropertyHeaders = {}): boolean {
    const retryHeader = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    const maxRetries = RabbitmqConsumeErrorFilter.MAX_RETRIES;
    return !(retryHeader in messageHeaders) || messageHeaders[retryHeader] < maxRetries;
  }
}
