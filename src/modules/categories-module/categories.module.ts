import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  providers: [...Object.values(CATEGORY_PROVIDERS.REPOSITORIES), ...Object.values(CATEGORY_PROVIDERS.USE_CASES)],
})
export class CategoriesModule {}
