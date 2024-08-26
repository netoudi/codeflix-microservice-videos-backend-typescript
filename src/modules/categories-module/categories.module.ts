import { Module } from '@nestjs/common';
import { CategoriesController } from '@/modules/categories-module/categories.controller';

@Module({
  controllers: [CategoriesController],
})
export class CategoriesModule {}
