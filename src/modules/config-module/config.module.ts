import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModuleOptions, ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';

export type DB_SCHEMA_TYPE = {
  DB_CONNECTION: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_CONNECTION: Joi.string().required().valid('mysql', 'sqlite'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().when('DB_CONNECTION', { is: 'mysql', then: Joi.required() }),
  DB_DATABASE: Joi.string().when('DB_CONNECTION', { is: 'mysql', then: Joi.required() }),
  DB_USERNAME: Joi.string().when('DB_CONNECTION', { is: 'mysql', then: Joi.required() }),
  DB_PASSWORD: Joi.string().when('DB_CONNECTION', { is: 'mysql', then: Joi.required() }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
};

export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE;

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): any {
    const { envFilePath, ...otherOptions } = options;
    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        // first load .env overrides the next load .env
        ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath]),
        join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
        join(process.cwd(), 'envs', `.env`),
      ],
      validationSchema: Joi.object({
        ...CONFIG_DB_SCHEMA,
      }),
      ...otherOptions,
    });
  }
}
