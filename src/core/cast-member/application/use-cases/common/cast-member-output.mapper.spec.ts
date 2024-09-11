import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSearchResult } from '@/core/cast-member/domain/cast-member.repository';

describe('CastMemberOutputMapper Unit Tests', () => {
  it('should convert a cast member in output', () => {
    const castMember = CastMember.fake().aCastMember().build();
    const output = CastMemberOutputMapper.toOutput(castMember);
    expect(output).toStrictEqual({
      id: castMember.id.value,
      name: castMember.name,
      type: castMember.type,
      created_at: castMember.created_at,
    });
  });

  it('should convert search result to pagination', () => {
    let result = new CastMemberSearchResult({
      items: [],
      total: 0,
      current_page: 1,
      per_page: 1,
    });
    let output = CastMemberOutputMapper.toPagination(result);
    expect(output).toStrictEqual({
      items: [],
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      last_page: result.last_page,
    });
    result = new CastMemberSearchResult({
      items: CastMember.fake().theCastMembers(3).build(),
      total: 3,
      current_page: 1,
      per_page: 15,
    });
    output = CastMemberOutputMapper.toPagination(result);
    expect(output).toStrictEqual({
      items: result.items.map(CastMemberOutputMapper.toOutput),
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      last_page: result.last_page,
    });
  });
});
