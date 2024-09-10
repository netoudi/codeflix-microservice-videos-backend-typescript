import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import {
  CastMemberFilter,
  CastMemberSearchParams,
  ICastMemberRepository,
} from '@/core/cast-member/domain/cast-member.repository';
import { PaginationOutput } from '@/core/shared/application/pagination-output.mapper';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class ListCastMembersUseCase implements IUseCase<ListCastMembersInput, ListCastMembersOutput> {
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const result = await this.castMemberRepository.search(new CastMemberSearchParams(input));

    return CastMemberOutputMapper.toPagination(result);
  }
}

export type ListCastMembersInput = {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection | null;
  filter?: CastMemberFilter | null;
};

export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;
