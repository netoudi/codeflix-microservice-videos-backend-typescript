import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSearchResult } from '@/core/cast-member/domain/cast-member.repository';
import { PaginationOutput, PaginationOutputMapper } from '@/core/shared/application/pagination-output.mapper';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: number;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(castMember: CastMember): CastMemberOutput {
    return {
      id: castMember.id.value,
      name: castMember.name,
      type: castMember.type,
      created_at: castMember.created_at,
    };
  }

  static toPagination(result: CastMemberSearchResult): PaginationOutput<CastMemberOutput> {
    return PaginationOutputMapper.toOutput(result.items.map(CastMemberOutputMapper.toOutput), result);
  }
}
