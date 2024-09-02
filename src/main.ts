import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { WrapperDataInterceptor } from '@/modules/interceptors/wrapper-data/wrapper-data.interceptor';
import { EntityValidationErrorFilter } from '@/modules/shared-module/filters/entity-validation-error.filter';
import { NotFoundErrorFilter } from '@/modules/shared-module/filters/not-found-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)), new WrapperDataInterceptor());
  app.useGlobalFilters(new EntityValidationErrorFilter(), new NotFoundErrorFilter());

  await app.listen(3333);
}

bootstrap().then(() => {
  console.log(`🚀 HTTP server listening on http://host.docker.internal:3333`);
});
