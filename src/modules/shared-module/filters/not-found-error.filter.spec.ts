import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Entity } from '@/core/shared/domain/entity';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { ValueObject } from '@/core/shared/domain/value-object';
import { NotFoundErrorFilter } from '@/modules/shared-module/filters/not-found-error.filter';

class StubEntity extends Entity {
  get entityId(): ValueObject {
    throw new Error('Method not implemented.');
  }
  toJSON() {
    throw new Error('Method not implemented.');
  }
}

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new NotFoundError('fake id', StubEntity);
  }
}

describe('NotFoundErrorFilter Unit Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new NotFoundErrorFilter());
    await app.init();
  });

  it.only('should catch a NotFoundError', () => {
    return request(app.getHttpServer()).get('/stub').expect({
      statusCode: 404,
      error: 'Not Found',
      message: 'Entity StubEntity with id fake id not found',
    });
  });
});
