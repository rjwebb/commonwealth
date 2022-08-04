import * as Sequelize from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import { ModelStatic, ModelInstance } from './types';

export type ChainEntityMetaAttributes = {
  id: number;
  title?: string;
  chain: string;
  author?: string;
}

export type ChainEntityMetaInstance = ModelInstance<ChainEntityMetaAttributes>;

export type ChainEntityMetaModelStatic = ModelStatic<ChainEntityMetaInstance>;

export default (
  sequelize: Sequelize.Sequelize,
  dataTypes: typeof DataTypes,
): ChainEntityMetaModelStatic => {
  const ChainEntityMeta = <ChainEntityMetaModelStatic>sequelize.define<ChainEntityMetaInstance, ChainEntityMetaAttributes>('ChainEntity', {
    id: { type: dataTypes.INTEGER, allowNull: false, unique: true },
    title: { type: dataTypes.STRING, allowNull: true },
    chain: { type: dataTypes.STRING, allowNull: false },
    author: { type: dataTypes.STRING, allowNull: true }
  }, {
    tableName: 'ChainEntityMeta',
    timestamps: false,
    underscored: true,
    paranoid: false,
    indexes: [
      { fields: ['id'] },
    ],
  });

  ChainEntityMeta.associate = (models) => {};

  return ChainEntityMeta;
};
