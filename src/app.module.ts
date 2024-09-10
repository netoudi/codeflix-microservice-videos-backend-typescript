import { Module } from '@nestjs/common';
import { CastMembersModule } from '@/modules/cast-members-module/cast-members.module';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { SharedModule } from '@/modules/shared-module/shared.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule, CastMembersModule, SharedModule],
})
export class AppModule {}
