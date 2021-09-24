import {
  Sequelize,
  Model,
  DataTypes,
  Optional,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  Association,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin } from 'sequelize';
import moment from 'moment';
import DatabaseManager from '../db';
import ZapperApi from '../lib/zapperfi';
import DisguiseCache from './disguiseCache';
import AddressBalances from './addressBalances';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

interface DisguiseAttributes {
  id?: string;
  address: string;
  url: string;
  name: string;
  generation: number;
  expiration?: number;
  preset?: number;
  permissions?: object;
  version: number;
};

export interface DisguiseInput extends Optional<DisguiseAttributes, 'id'> {};
export interface DisguiseOutput extends Required<DisguiseAttributes> {};

class Disguise extends Model<DisguiseAttributes> {
  public id?: string;
  public address!: string;
  public url!: string;
  public name!: string;
  public generation!: number;
  public expiration!: number;
  public preset!: number;
  public permissions?: object;
  public version!: number;

  static associate(models: any) {
    Disguise.hasOne(models.DisguiseCache, { foreignKey: 'disguiseId' });
  }

  static async generate(address: string, name: string, duration: number, preset: number, cache: boolean = true) {
    let url = Disguise.generateUrl();
    let generationTimestamp = parseInt(moment.utc().format('X'));
    let expirationTimestamp = generationTimestamp + duration;

    try {
      let disguise = await Disguise.create({
        address: address,
        url: url, 
        name: name,
        generation: generationTimestamp,
        expiration: expirationTimestamp,
        preset: preset,
        permissions: {},
        version: 1
      });

      if(cache) {
        await Disguise.generateCache(disguise);
      }

      
      return disguise;
    } catch(e) {
      console.log(`Could not generate disguise for address: ${address}, name: ${name}, duration: ${duration}, preset: ${preset}`);
      return e;
    }
  }

  static async saveCache(disguise: Disguise, balances: AddressBalances) {
    await DisguiseCache.create({
      generation: moment().format('X'),
      expiration: moment().add(5, 'minutes').format('X'),
      data: balances,
      disguiseId: disguise.id
    });
  }

  static async generateCache(disguise: Disguise) { // find TS compliant solution
    let addressBalances = await ZapperApi.getBalances(disguise, false);

    await DisguiseCache.create({
      generation: moment().format('X'),
      expiration: moment().add(5, 'minutes').format('X'),
      data: addressBalances,
      disguiseId: disguise.id
    });
  }

  static generateUrl(length: number = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let url = '';

    for (let i = 0; i < length; i++ ) {
      url += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return url;
  }

  isValid() {
    return !moment(this.expiration, 'X').isBefore(moment());
  }

  filter() {
    return {
      url: this.url,
      name: this.name,
      expiration: this.expiration, 
      preset: this.preset
    };
  }
};

Disguise.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  generation: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  preset: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize: db,
  modelName: 'Disguise',
  timestamps: false,
  paranoid: false
});

Disguise.addHook('afterFind', async (disguise: Disguise) => {
  if(moment(disguise.expiration, 'X').isBefore(moment())) {
    console.log(`Disguise with id ${disguise.id} is expired: cya!`);
    await disguise.destroy();
  }
});

export default Disguise;

