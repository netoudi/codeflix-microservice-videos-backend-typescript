import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';

//@ts-expect-error - the type is correct
const joiJson = Joi.extend((joi) => {
  return {
    type: 'object',
    base: joi.object(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coerce(value, _schema) {
      if (value[0] !== '{' && !/^\s*\{/.test(value)) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (err) {
        console.error(err);
      }
    },
  };
});

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

type CONFIG_GOOGLE_SCHEMA_TYPE = {
  GOOGLE_CLOUD_CREDENTIALS: object;
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: string;
};

export const CONFIG_GOOGLE_SCHEMA: Joi.StrictSchemaMap<CONFIG_GOOGLE_SCHEMA_TYPE> = {
  GOOGLE_CLOUD_CREDENTIALS: joiJson.object().required(),
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
};

type CONFIG_RABBITMQ_SCHEMA_TYPE = {
  RABBITMQ_URI: string;
  RABBITMQ_REGISTER_HANDLERS: boolean;
};

export const CONFIG_RABBITMQ_SCHEMA: Joi.StrictSchemaMap<CONFIG_RABBITMQ_SCHEMA_TYPE> = {
  RABBITMQ_URI: Joi.string().required(),
  RABBITMQ_REGISTER_HANDLERS: Joi.boolean().required(),
};

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): any {
    const { envFilePath, ...otherOptions } = options;
    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        // first load .env overrides the next load .env
        ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath as string]),
        join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
        join(process.cwd(), 'envs', `.env`),
      ],
      validationSchema: Joi.object({
        ...CONFIG_DB_SCHEMA,
        ...CONFIG_RABBITMQ_SCHEMA,
      }),
      ...otherOptions,
    });
  }
}
