import { instanceToPlain } from 'class-transformer';
import qs from 'qs';
import request from 'supertest';
import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { CastMembersController } from '@/modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import { ListCastMembersFixture } from '@/modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from '@/modules/shared-module/testing/helpers';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    repository = appHelper.app.get<ICastMemberRepository>(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/cast-members (GET)', () => {
    describe('should return cast members sorted by created_at when request query is empty', () => {
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when query params is $send_data', ({ send_data, expected }) => {
        const queryParams = new URLSearchParams(send_data as any).toString();
        return request(appHelper.app.getHttpServer())
          .get(`/cast-members?${queryParams}`)
          .expect(200)
          .expect({
            data: expected.entities.map((e) => {
              return instanceToPlain(CastMembersController.serialize(CastMemberOutputMapper.toOutput(e)));
            }),
            meta: expected.meta,
          });
      });
    });

    describe('should return cast members using paginate, filter and sort', () => {
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when query params is $send_data', ({ send_data, expected }) => {
        const queryParams = qs.stringify(send_data);
        return request(appHelper.app.getHttpServer())
          .get(`/cast-members?${queryParams}`)
          .expect(200)
          .expect({
            data: expected.entities.map((e) => {
              return instanceToPlain(CastMembersController.serialize(CastMemberOutputMapper.toOutput(e)));
            }),
            meta: expected.meta,
          });
      });
    });
  });
});
