import request from 'supertest';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICastMemberRepository>(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/cast-members/:id (DELETE)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: 'b11c9be1-b619-4ef5-be1b-a1cd9ef265b7',
          expected: {
            statusCode: 404,
            error: 'Not Found',
            message: 'Entity CastMember with id b11c9be1-b619-4ef5-be1b-a1cd9ef265b7 not found',
          },
        },
        {
          id: 'fake-id',
          expected: {
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: 'Validation failed (uuid is expected)',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .delete(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a cast member with response status 204', async () => {
      const castMember = CastMember.fake().aCastMember().build();
      await repository.insert(castMember);
      await request(appHelper.app.getHttpServer()).delete(`/cast-members/${castMember.id.value}`).expect(204);
      await expect(repository.findById(castMember.id)).resolves.toBeNull();
    });
  });
});
