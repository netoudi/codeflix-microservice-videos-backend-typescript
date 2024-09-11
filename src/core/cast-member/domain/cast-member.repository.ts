import { CastMember, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { ISearchableRepository } from '@/core/shared/domain/repository/repository-interface';
import { SearchParams } from '@/core/shared/domain/repository/search-params';
import { SearchResult } from '@/core/shared/domain/repository/search-result';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

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
  extends ISearchableRepository<CastMember, Uuid, CastMemberFilter, CastMemberSearchParams, CastMemberSearchResult> {}
