import { INestApplication } from '@nestjs/common';

declare module 'supertest' {
  interface Test extends supertest.SuperAgentRequest {
    authenticate(app: INestApplication, forceAdmin: boolean = true): this;
  }
}
