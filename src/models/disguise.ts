import {
  Model,
  DataTypes,
  Optional } from 'sequelize';

import moment from 'moment';
import DatabaseManager from '../db';
import ZapperApi from '../lib/zapperfi';
import Web3Api from '../lib/web3';
import AddressBalances from './addressBalances';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();
const web3 = new Web3Api();

interface DisguiseAttributes {
  id?: string;
  address: string;
  addresses?: string | null;
  url: string;
  name: string;
  generation: number;
  expiration?: number;
  preset?: number;
  permissions?: object;
  version: number;
  provider: string;
  status: number;
  cache: object | null;
  cacheGeneration: number | null;
  cacheExpiration: number | null;
  options: DisguiseOptions | null;
};

export interface DisguiseOptions {
  isGroupAssetsUnder: boolean;
  groupAssetsUnder: number;
  ignoreNFTs: boolean;
  isSnapshot: boolean;
  showNFTCollections: boolean;
};

enum DisguiseStatus {
  FETCHING = 0,
  SUCCESS = 1,
  UPDATED = 2,
  DISGUISE_EXPIRED = 3,
  FAILED = 4,
  CACHE_EXPIRED = 5,
  IPFS_SAVING = 6,
  ZAPPER_408_1 = 10,
  ZAPPER_408_2 = 11,
  ZAPPER_408_FINAL = 12,
  ZAPPER_FAILED_CACHE_UPDATE = 13,
  IPFS_FAILED = 20
};

export interface DisguiseInput extends Optional<DisguiseAttributes, 'id'> {};
export interface DisguiseOutput extends Required<DisguiseAttributes> {};

class Disguise extends Model<DisguiseAttributes> {
  public id?: string;
  public address!: string;
  public addresses?: string | null;
  public url!: string;
  public name!: string;
  public generation!: number;
  public expiration!: number;
  public preset!: number;
  public permissions?: object;
  public version!: number;
  public provider!: string;
  public status!: number;
  public cache?: object | null;
  public cacheGeneration?: number | null;
  public cacheExpiration?: number | null;
  public options!: DisguiseOptions | null;

  static async generate(addresses: string[], name: string, duration: number, preset: number, options: DisguiseOptions, cache: boolean = true) {
    let url = Disguise.generateUrl();
    let generationTimestamp = Number(moment.utc().format('X'));
    let expirationTimestamp = generationTimestamp + duration;
    let addressBalances, disguise;

    try {
      disguise = Disguise.build({
        address: JSON.stringify(addresses),
        url: url, 
        name: name,
        generation: generationTimestamp,
        expiration: expirationTimestamp,
        preset: preset,
        permissions: {},
        version: 2,
        provider: 'zapperfi',
        status: DisguiseStatus.FETCHING,
        cache: null,
        cacheGeneration: null,
        cacheExpiration: null,
        options: options
      });

      if(cache) {
        addressBalances = await Disguise.generateCache(disguise);

        if(disguise.options?.isSnapshot) {
          disguise.set({
            status: DisguiseStatus.IPFS_SAVING,
            cache: addressBalances,
          });
          
          let ipfsSuccess = await web3.addRecord(disguise);

          // entry will only be saved if IPFS failed, if not it no DB record saved
          if(!ipfsSuccess) {
            disguise.update({
              status: DisguiseStatus.IPFS_FAILED
            });
          }
        } else {
          disguise.set({
            status: DisguiseStatus.SUCCESS,
            cache: addressBalances,
            cacheGeneration: Number(moment().format('X')),
            cacheExpiration: Number(moment().add(15, 'minutes').format('X'))
          });

          await disguise.save();
        }
      }
      
      return disguise;
    } catch(e: any) {
      console.log(e);
      let status: DisguiseStatus = (e.response?.status == 408) ? DisguiseStatus.ZAPPER_408_1 : DisguiseStatus.FAILED;

      await disguise?.update({
        address: JSON.stringify(addresses),
        status: status,
        cache: null,
        cacheGeneration: Number(moment().format('X')),
        cacheExpiration: Number(moment().add(0, 'minutes').format('X'))
      });

      console.log(`Could not generate disguise for address: ${JSON.stringify(addresses)}, name: ${name}, duration: ${duration}, preset: ${preset}`);
      throw e;
    }
  }

  static async saveCache(disguise: Disguise, balances: AddressBalances) {
    await disguise.update({
        cache: balances,
        cacheGeneration: Number(moment().format('X')),
        cacheExpiration: Number(moment().add(15, 'minutes').format('X'))
      });
  }

  static async generateCache(disguise: Disguise) {
    try {
      let addressBalances = await ZapperApi.getBalances(disguise, false);

      return addressBalances;    
    } catch(e) {
      throw e;
    }
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

  isCacheValid() {
    // return false; // for dev only!!
    return !moment(this.cacheExpiration, 'X').isBefore(moment()) && this.cache != null;
  }

  filter() {
    return {
      url: this.url,
      name: this.name,
      expiration: this.expiration,
      generation: this.generation,
      preset: this.preset,
      options: {
        isSnapshot: this.options?.isSnapshot
      }
    };
  }

  static prepareIPFS(disguiseData: any) {
    delete disguiseData.id;
    delete disguiseData.address;
    delete disguiseData.permissions;
    delete disguiseData.cacheGeneration;
    delete disguiseData.cacheExpiration;
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
    allowNull: false,
    get() {
      return this.getDataValue('address');
    }
  },
  addresses: {
    type: DataTypes.VIRTUAL,
    get() {
      let version = this.getDataValue('version');

      switch(version) {
        case 1:
          return this.getDataValue('address') || null;
        
        case 2:
          return this.getDataValue('address') != null ? JSON.parse(this.getDataValue('address')).join() : null
      }
      
    }
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
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cache: {
    type: DataTypes.JSON,
    allowNull: true
  },
  cacheGeneration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cacheExpiration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
}, {
  sequelize: db,
  modelName: 'Disguise',
  timestamps: false,
  paranoid: false
});

Disguise.addHook('afterFind', async (disguise: Disguise) => {
  if(disguise && moment(disguise.expiration, 'X').isBefore(moment())) {
    console.log(`Disguise with id ${disguise.id} is expired: cya!`);
    await disguise.destroy();
  }
});

export default Disguise;

