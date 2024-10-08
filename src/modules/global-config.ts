import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityValidationErrorFilter } from '@/modules/shared-module/filters/entity-validation-error.filter';
import { NotFoundErrorFilter } from '@/modules/shared-module/filters/not-found-error.filter';
import { WrapperDataInterceptor } from '@/modules/shared-module/interceptors/wrapper-data/wrapper-data.interceptor';

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)), new WrapperDataInterceptor());
  app.useGlobalFilters(new EntityValidationErrorFilter(), new NotFoundErrorFilter());
}
