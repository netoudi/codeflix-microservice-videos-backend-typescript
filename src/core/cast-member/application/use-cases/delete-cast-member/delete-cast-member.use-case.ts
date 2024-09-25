import { CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';

export class DeleteCastMemberUseCase implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput> {
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<DeleteCastMemberOutput> {
    await this.castMemberRepository.delete(new CastMemberId(input.id));
  }
}

export type DeleteCastMemberInput = {
  id: string;
};

export type DeleteCastMemberOutput = void;
