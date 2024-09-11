import { Module } from '@nestjs/common';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
})
export class MigrationsModule {}
