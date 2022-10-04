import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import { AddressAttributes } from './address';
import { ChainAttributes } from './chain';
import {
  RolePermissionAttributes,
  RolePermissionInstance,
} from './role_assignment';
import { ModelStatic, ModelInstance } from './types';

export type name = 'admin' | 'moderator' | 'member';

export type CommunityRoleAttributes = {
  permission: name;
  id?: number;
  chain_id: string;
  permissions?: bigint;
  created_at?: Date;
  updated_at?: Date;

  // associations
  RolePermissions?: RolePermissionAttributes[];
};

export type CommunityRoleInstance = ModelInstance<CommunityRoleAttributes> & {
  getRolePermissions: Sequelize.HasManyGetAssociationsMixin<RolePermissionInstance>;
};

export type CommunityRoleModelStatic = ModelStatic<CommunityRoleInstance>;

export default (
  sequelize: Sequelize.Sequelize,
  dataTypes: typeof DataTypes
): CommunityRoleModelStatic => {
  const CommunityRole = <CommunityRoleModelStatic>sequelize.define(
    'CommunityRole',
    {
      id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      chain_id: { type: dataTypes.STRING, allowNull: false },
      name: {
        type: dataTypes.ENUM,
        values: ['admin', 'moderator', 'member'],
        defaultValue: 'member',
        allowNull: false,
      },
      permissions: {
        type: dataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false,
      },
      created_at: { type: dataTypes.DATE, allowNull: false },
      updated_at: { type: dataTypes.DATE, allowNull: false },
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      tableName: 'CommunityRoles',
      underscored: true,
      indexes: [{ fields: ['chain_id'] }],
    }
  );

  CommunityRole.associate = (models) => {
    models.CommunityRole.hasMany(models.RoleAssignment, {
      foreignKey: 'community_role_id',
    });
  };

  return CommunityRole;
};
