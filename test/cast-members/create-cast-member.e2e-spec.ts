import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { CastMembersController } from '@/modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { CreateCastMemberFixture } from '@/modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICastMemberRepository>(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/cast-members (POST)', () => {
    describe('should return a response error with 422 status code when request body is invalid', () => {
      const invalidRequest = CreateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const invalidRequest = CreateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a cast member', () => {
      const arrange = CreateCastMemberFixture.arrangeForCreate();

      test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
        const response = await request(appHelper.app.getHttpServer()).post('/cast-members').send(send_data).expect(201);
        const keysInResponse = CreateCastMemberFixture.keysInResponse;
        expect(Object.keys(response.body)).toStrictEqual(['data']);
        expect(Object.keys(response.body.data)).toStrictEqual(keysInResponse);
        const id = response.body.data.id;
        const castMemberCreated = await repository.findById(new Uuid(id));
        const presenter = CastMembersController.serialize(CastMemberOutputMapper.toOutput(castMemberCreated));
        const serialized = instanceToPlain(presenter);
        expect(response.body.data).toStrictEqual({
          id: serialized.id,
          name: expected.name,
          type: expected.type,
          created_at: serialized.created_at,
        });
      });
    });
  });
});
