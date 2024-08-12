import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Config } from '@/shared/infra/config';

export function setupSequelize(options: SequelizeOptions = {}) {
  let _sequelize: Sequelize;

  beforeAll(async () => {
    _sequelize = new Sequelize({
      ...Config.db(),
      ...options,
    });
  });

  beforeEach(async () => {
    await _sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await _sequelize.close();
  });

  return {
    get sequelize(): Sequelize {
      return _sequelize;
    },
  };
}
