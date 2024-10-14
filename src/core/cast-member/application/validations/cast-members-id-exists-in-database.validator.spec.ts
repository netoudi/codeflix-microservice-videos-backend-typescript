import { CastMembersIdExistsInDatabaseValidator } from '@/core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';

describe('CastMembersIdExistsInDatabaseValidator Unit Tests', () => {
  let castMemberRepository: CastMemberInMemoryRepository;
  let validator: CastMembersIdExistsInDatabaseValidator;

  beforeEach(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
    validator = new CastMembersIdExistsInDatabaseValidator(castMemberRepository);
  });

  it('should return many not found error when cast members id is not exists in database', async () => {
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const spyExistsById = jest.spyOn(castMemberRepository, 'existsById');
    let [categoriesId, errorsCategoriesId] = await validator.validate([castMemberId1.value, castMemberId2.value]);
    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(castMemberId1.value, CastMember),
      new NotFoundError(castMemberId2.value, CastMember),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const castMember1 = CastMember.fake().aCastMember().build();
    await castMemberRepository.insert(castMember1);

    [categoriesId, errorsCategoriesId] = await validator.validate([castMember1.id.value, castMemberId2.value]);
    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual([new NotFoundError(castMemberId2.value, CastMember)]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of categories id', async () => {
    const castMember1 = CastMember.fake().aCastMember().build();
    const castMember2 = CastMember.fake().aCastMember().build();
    await castMemberRepository.bulkInsert([castMember1, castMember2]);
    const [categoriesId, errorsCategoriesId] = await validator.validate([castMember1.id.value, castMember2.id.value]);
    expect(categoriesId).toHaveLength(2);
    expect(errorsCategoriesId).toStrictEqual(null);
    expect(categoriesId[0]).toBeValueObject(castMember1.id);
    expect(categoriesId[1]).toBeValueObject(castMember2.id);
  });
});
