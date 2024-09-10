import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn = async ({ context: sequelize }) => {
  await (sequelize as Sequelize).getQueryInterface().createTable('cast_members', {
    id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataType.TINYINT,
      allowNull: false,
    },
    created_at: {
      type: DataType.DATE(3),
      allowNull: false,
    },
  });
};

export const down: MigrationFn = async ({ context: sequelize }) => {
  await (sequelize as Sequelize).getQueryInterface().dropTable('cast_members');
};
