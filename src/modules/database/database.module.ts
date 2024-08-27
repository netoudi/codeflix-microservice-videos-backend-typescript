import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { DB_SCHEMA_TYPE } from '@/modules/config-module/config.module';

const MODELS = [CategoryModel];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<DB_SCHEMA_TYPE>) => {
        const dbConnection = configService.get('DB_CONNECTION');
        if (dbConnection === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: configService.get('DB_HOST'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            models: MODELS,
          };
        }
        if (dbConnection === 'mysql') {
          return {
            dialect: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            database: configService.get('DB_DATABASE'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            models: MODELS,
          };
        }
        throw new Error(`Unsupported database configuration: ${dbConnection}`);
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
