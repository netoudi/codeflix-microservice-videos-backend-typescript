import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';

export class GetCastMemberUseCase implements IUseCase<GetCastMemberInput, GetCastMemberOutput> {
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<GetCastMemberOutput> {
    const castMember = await this.castMemberRepository.findById(new CastMemberId(input.id));

    if (!castMember) throw new NotFoundError(input.id, CastMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type GetCastMemberInput = {
  id: string;
};

export type GetCastMemberOutput = CastMemberOutput;
