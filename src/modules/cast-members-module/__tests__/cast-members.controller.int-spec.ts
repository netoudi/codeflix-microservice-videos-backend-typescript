import { Test, TestingModule } from '@nestjs/testing';
import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { CreateCastMemberUseCase } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@/core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@/core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { UpdateCastMemberUseCase } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { CastMembersController } from '@/modules/cast-members-module/cast-members.controller';
import { CastMembersModule } from '@/modules/cast-members-module/cast-members.module';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '@/modules/cast-members-module/cast-members.presenter';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';
import {
  CreateCastMemberFixture,
  ListCastMembersFixture,
  UpdateCastMemberFixture,
} from '@/modules/cast-members-module/testing/cast-member-fixture';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';

describe('CastMembersController Integration Tests', () => {
  let controller: CastMembersController;
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CastMembersModule],
    }).compile();
    controller = module.get<CastMembersController>(CastMembersController);
    repository = module.get<ICastMemberRepository>(CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateCastMemberUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateCastMemberUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListCastMembersUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetCastMemberUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteCastMemberUseCase);
  });

  describe('should create a cast member', () => {
    const arrange = CreateCastMemberFixture.arrangeForCreate();
    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.create(send_data);
      const entity = await repository.findById(new Uuid(presenter.id));
      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        name: expected.name,
        type: expected.type,
        created_at: presenter.created_at,
      });
      const output = CastMemberOutputMapper.toOutput(entity);
      expect(presenter).toEqual(new CastMemberPresenter(output));
    });
  });

  describe('should update a cast member', () => {
    const arrange = UpdateCastMemberFixture.arrangeForUpdate();
    const castMember = CastMember.fake().aCastMember().build();

    beforeEach(async () => {
      await repository.insert(castMember);
    });

    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.update(castMember.id.value, send_data);
      const entity = await repository.findById(new Uuid(presenter.id));
      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        name: expected.name ?? castMember.name,
        type: expected.type ?? castMember.type,
        created_at: presenter.created_at,
      });
      const output = CastMemberOutputMapper.toOutput(entity);
      expect(presenter).toEqual(new CastMemberPresenter(output));
    });
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const response = await controller.remove(castMember.id.value);
    expect(response).not.toBeDefined();
    await expect(repository.findById(castMember.id)).resolves.toBeNull();
  });

  it('should get a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const presenter = await controller.findOne(castMember.id.value);
    expect(presenter.id).toBe(castMember.id.value);
    expect(presenter.name).toBe(castMember.name);
    expect(presenter.type).toBe(castMember.type);
    expect(presenter.created_at).toStrictEqual(castMember.created_at);
  });

  describe('search method', () => {
    describe('should sorted cast members by created_at', () => {
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        expect(presenter).toEqual(
          new CastMemberCollectionPresenter({
            items: entities.map(CastMemberOutputMapper.toOutput),
            current_page: paginationProps.meta.current_page,
            last_page: paginationProps.meta.last_page,
            per_page: paginationProps.meta.per_page,
            total: paginationProps.meta.total,
          }),
        );
      });
    });

    describe('should return castMembers using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        expect(presenter).toEqual(
          new CastMemberCollectionPresenter({
            items: entities.map(CastMemberOutputMapper.toOutput),
            current_page: paginationProps.meta.current_page,
            last_page: paginationProps.meta.last_page,
            per_page: paginationProps.meta.per_page,
            total: paginationProps.meta.total,
          }),
        );
      });
    });
  });
});
