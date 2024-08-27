import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database/database.module';

@Module({
  imports: [DatabaseModule, CategoriesModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
