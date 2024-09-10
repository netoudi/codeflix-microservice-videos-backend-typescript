import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { CastMembersController } from '@/modules/cast-members-module/cast-members.controller';
import { CAST_MEMBER_PROVIDERS } from '@/modules/cast-members-module/cast-members.providers';

@Module({
  imports: [SequelizeModule.forFeature([CastMemberModel])],
  controllers: [CastMembersController],
  providers: [...Object.values(CAST_MEMBER_PROVIDERS.REPOSITORIES), ...Object.values(CAST_MEMBER_PROVIDERS.USE_CASES)],
})
export class CastMembersModule {}
