import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { UpdateCastMemberInput } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.input';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@/core/cast-member/domain/cast-member.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { EntityValidationError } from '@/core/shared/domain/validators/entity-validation.error';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export class UpdateCastMemberUseCase implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput> {
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
    const castMember = await this.castMemberRepository.findById(new Uuid(input.id));

    if (!castMember) throw new NotFoundError(input.id, CastMember);

    'name' in input && input.name !== undefined && input.name !== null && castMember.changeName(input.name);
    'type' in input && input.type !== undefined && input.type !== null && castMember.changeType(input.type);

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepository.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type UpdateCastMemberOutput = CastMemberOutput;
