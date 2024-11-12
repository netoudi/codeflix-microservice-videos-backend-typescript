import { Module } from '@nestjs/common';
import { CastMembersModule } from '@/modules/cast-members-module/cast-members.module';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { EventModule } from '@/modules/event-module/event.module';
import { GenresModule } from '@/modules/genres-module/genres.module';
import { RabbitmqFakeModule } from '@/modules/rabbitmq-fake/rabbitmq-fake.module';
import { SharedModule } from '@/modules/shared-module/shared.module';
import { VideosModule } from '@/modules/videos-module/videos.module';
import { UseCaseModule } from './modules/use-case-module/use-case.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    SharedModule,
    EventModule,
    UseCaseModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
    RabbitmqFakeModule,
  ],
})
export class AppModule {}
