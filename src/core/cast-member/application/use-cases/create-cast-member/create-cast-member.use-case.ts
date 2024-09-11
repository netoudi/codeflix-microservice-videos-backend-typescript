import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { CreateCastMemberInput } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.input';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { EntityValidationError } from '@/core/shared/domain/validators/entity-validation.error';

export class CreateCastMemberUseCase implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput> {
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const castMember = CastMember.create(input);

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepository.insert(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
