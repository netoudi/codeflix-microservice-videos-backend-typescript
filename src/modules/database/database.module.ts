import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';

@Global()
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      host: ':memory:',
      logging: false,
      models: [CategoryModel],
    }),
  ],
})
export class DatabaseModule {}
