import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { CastMembersController } from '@/modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { UpdateCastMemberFixture } from '@/modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICastMemberRepository>(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/cast-members/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const faker = CastMember.fake().aCastMember();
      const arrange = [
        {
          id: 'b11c9be1-b619-4ef5-be1b-a1cd9ef265b7',
          send_data: { name: faker.name },
          expected: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Entity CastMember with id b11c9be1-b619-4ef5-be1b-a1cd9ef265b7 not found',
          },
        },
        {
          id: 'fake-id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: 'Validation failed (uuid is expected)',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, send_data, expected }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${id}`)
          .send(send_data)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/b11c9be1-b619-4ef5-be1b-a1cd9ef265b7`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const invalidRequest = UpdateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({ label: key, value: invalidRequest[key] }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().aCastMember().build();
        await repository.insert(castMember);
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${castMember.id.value}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should update a castMember', () => {
      const arrange = UpdateCastMemberFixture.arrangeForUpdate();

      test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
        const castMember = CastMember.fake().aCastMember().build();
        await repository.insert(castMember);
        const response = await request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${castMember.id.value}`)
          .send(send_data)
          .expect(200);
        const keysInResponse = UpdateCastMemberFixture.keysInResponse;
        expect(Object.keys(response.body)).toStrictEqual(['data']);
        expect(Object.keys(response.body.data)).toStrictEqual(keysInResponse);
        const id = response.body.data.id;
        const castMemberUpdated = await repository.findById(new CastMemberId(id));
        const presenter = CastMembersController.serialize(CastMemberOutputMapper.toOutput(castMemberUpdated!));
        const serialized = instanceToPlain(presenter);
        expect(response.body.data).toStrictEqual(serialized);
        expect(response.body.data).toStrictEqual({
          id: serialized.id,
          name: expected.name ?? castMemberUpdated!.name,
          type: expected.type ?? castMemberUpdated!.type,
          created_at: serialized.created_at,
        });
      });
    });
  });
});
