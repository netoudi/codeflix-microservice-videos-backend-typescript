import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3333);
}

bootstrap().then(() => {
  console.log(`🚀 HTTP server listening on http://host.docker.internal:3333`);
});
