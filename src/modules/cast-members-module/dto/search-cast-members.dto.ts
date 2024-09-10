import { ListCastMembersInput } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { CastMemberFilter } from '@/core/cast-member/domain/cast-member.repository';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class SearchCastMembersDto implements ListCastMembersInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection | null;
  filter?: CastMemberFilter | null;
}
