import { DataTypes, Sequelize } from 'sequelize';
import { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('category_video', {
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });
  await sequelize.getQueryInterface().addConstraint('category_video', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'category_video_video_id',
    references: {
      table: 'videos',
      field: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
  await sequelize.getQueryInterface().addConstraint('category_video', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'category_video_category_id',
    references: {
      table: 'categories',
      field: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeConstraint('category_video', 'category_video_video_id');
  await sequelize.getQueryInterface().removeConstraint('category_video', 'category_video_category_id');
  await sequelize.getQueryInterface().dropTable('category_video');
};
