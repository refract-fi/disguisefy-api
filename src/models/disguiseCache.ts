import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import moment from 'moment';
import DatabaseManager from '../db';
import Disguise from './disguise';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

interface DisguiseCacheAttrtibutes {
  id?: number;
  generation: number;
  expiration: number;
  data: object;
  disguiseId: string;
};

export interface DisguiseCacheInput extends Optional<DisguiseCacheAttrtibutes, 'id'> {};
export interface DisguiseCacheOutput extends Required<DisguiseCacheAttrtibutes> {};

class DisguiseCache extends Model {
  public id?: number;
  public generation!: number;
  public expiration!: number;
  public data!: object;
  public disguiseId!: string;

  isValid() {
    return !moment(this.expiration, 'X').isBefore(moment());
  }

  static associate(models: any) {
    DisguiseCache.belongsTo(models.Disguise, { foreignKey: 'disguiseId' });
  }
};

DisguiseCache.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  generation: DataTypes.INTEGER,
  expiration: DataTypes.INTEGER,
  data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  disguiseId: {
    type: DataTypes.UUID,
    references: {
      model: Disguise,
      key: 'id'
    },
  }
}, {
  sequelize: db,
  modelName: 'DisguiseCache',
  tableName: 'DisguiseCache',
  timestamps: false,
  paranoid: false
});

// afterFind Hooks are quite dumb and will run even if no object was found
// in the case of null it would try to check .expiration property without the ?
DisguiseCache.addHook('afterFind', async (disguiseCache: DisguiseCache) => {
  if(moment(disguiseCache?.expiration, 'X').isBefore(moment())) {
    console.log(`DisguiseCache with id ${disguiseCache.id} is expired: cya!`);
    await disguiseCache.destroy();
  }
});

export default DisguiseCache;