import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { CategoriesModule } from '@/modules/categories-module/categories.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      host: ':memory:',
      logging: false,
      models: [CategoryModel],
    }),
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
