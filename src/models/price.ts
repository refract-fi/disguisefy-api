import {
  Model,
  DataTypes,
  Optional } from 'sequelize';

import DatabaseManager from '../db';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

// interface PriceAttributes {
//   id?: string;
//   symbol: string;
//   label: string | null;
//   network: string | null;
//   isGas: boolean;
//   address: string | null;
//   priceUSD: number | null;
//   source: string;
//   sourceIdentifier: string | null;
//   updatedAt: number | null;
//   updatedAtDisplay: string | null;
//   symbolDisplay: string | null;
//   labelDisplay: string | null;
//   networkDisplay: string | null;
// };

// export interface DisguiseInput extends Optional<PriceAttributes, 'id', 'symbol'> {};
// export interface DisguiseOutput extends Required<PriceAttributes> {};

class Price extends Model {
  public id?: string;
  public symbol: string;
  public label: string | null;
  public network: string | null;
  public isGas: boolean;
  public address: string | null;
  public priceUSD: number | null;
  public source: string;
  public sourceIdentifier: string | null;
  public updatedAt: number | null;
  public updatedAtDisplay: string 
  public symbolDisplay: string | null;
  public labelDisplay: string | null;
  public networkDisplay: string | null;
};

Price.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  network: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isGas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  priceUSD: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  sourceIdentifier: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  updatedAt: {
    type: DataTypes.NUMBER,
    allowNull: true,
    defaultValue: true
  },
  updatedAtDisplay: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  symbolDisplay: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  labelDisplay: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  networkDisplay: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
}, {
  sequelize: db,
  modelName: 'Price',
  tableName: 'Prices',
  timestamps: false,
  paranoid: false
});

export default Price;

