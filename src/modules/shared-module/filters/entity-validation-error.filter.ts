import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { union } from 'lodash';
import { EntityValidationError } from '@/core/shared/domain/validators/entity-validation.error';

@Catch(EntityValidationError)
export class EntityValidationErrorFilter implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(422).json({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: union(
        ...exception.errors.reduce(
          (acc, errors) =>
            acc.concat(
              //@ts-expect-error - errors can be string
              typeof errors === 'string' ? [[errors]] : Object.values(errors),
            ),
          [],
        ),
      ),
    });
  }
}
