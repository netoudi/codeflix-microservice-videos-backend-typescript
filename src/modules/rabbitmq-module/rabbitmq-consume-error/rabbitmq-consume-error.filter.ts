import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') return;

    console.log(exception);
  }
}
