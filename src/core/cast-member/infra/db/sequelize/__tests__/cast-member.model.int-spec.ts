import { DataType } from 'sequelize-typescript';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CastMemberModel Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  test('mapping props', () => {
    const attributesMap = CastMemberModel.getAttributes();
    const attributes = Object.keys(CastMemberModel.getAttributes());
    expect(attributes).toStrictEqual(['id', 'name', 'type', 'created_at']);

    const castMemberIdAttr = attributesMap.id;
    expect(castMemberIdAttr).toMatchObject({
      field: 'id',
      fieldName: 'id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attributesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const typeAttr = attributesMap.type;
    expect(typeAttr).toMatchObject({
      field: 'type',
      fieldName: 'type',
      allowNull: false,
      type: DataType.TINYINT(),
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  test('create', async () => {
    // arrange
    const arrange = {
      id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      name: 'John Dore',
      type: 1,
      created_at: new Date(),
    };
    // act
    const castMember = await CastMemberModel.create(arrange);
    // assert
    expect(castMember.toJSON()).toStrictEqual(arrange);
  });
});
