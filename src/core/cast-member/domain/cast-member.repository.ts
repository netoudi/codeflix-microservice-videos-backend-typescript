import { CastMember, CastMemberId, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { ISearchableRepository } from '@/core/shared/domain/repository/repository-interface';
import { SearchParams } from '@/core/shared/domain/repository/search-params';
import { SearchResult } from '@/core/shared/domain/repository/search-result';

export type CastMemberFilter = {
  name?: string | null;
  type?: CastMemberType | null;
};

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {
  get filter(): CastMemberFilter | null {
    return this._filter;
  }

  protected set filter(value: CastMemberFilter | null) {
    this._filter = value;
  }
}

export class CastMemberSearchResult extends SearchResult<CastMember> {}

export interface ICastMemberRepository
  extends ISearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > {}
