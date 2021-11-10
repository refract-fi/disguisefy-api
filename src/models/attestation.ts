import {
    Model,
    DataTypes,
    Optional } from 'sequelize';
  
  import moment from 'moment';
  import bcrypt from 'bcrypt';
  
  import DatabaseManager from '../db';
  
  const dbManager = DatabaseManager.getInstance();
  const db = dbManager.getSequelize();
  const saltRounds = 10;
  
  interface AttestationAttributes {
    id?: string;
    name: string;
    type: string;
    url: string;
    secret: string;
    status: number;
    amount: number;
    unit: string;
    generation: number;
    confirmation: number | null;
    expiration?: number | null;
  };
  
  enum DisguiseStatus {
    PENDING = 0,
    SIGNED_VALID = 1,
    SIGNED_INVALID = 2,
    ERROR = 3,
    EXPIRED = 4
  };
  
  export interface AttestationInput extends Optional<AttestationAttributes, 'id'> {};
  export interface AttestationOutput extends Required<AttestationAttributes> {};
  
  class Attestation extends Model<AttestationAttributes> {
    public id?: string;
    public name?: string;
    public type?: string;
    public url?: string;
    public secret?: string;
    public status?: number;
    public amount?: number;
    public unit?: string;
    public generation?: number;
    public confirmation?: number;
    public expiration?: number;

    static generateUrl(length: number = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let url = '';
    
        for (let i = 0; i < length; i++ ) {
          url += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    
        return url;
    }
  
  };
  
  Attestation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    generation: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    confirmation: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    expiration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
  }, {
    sequelize: db,
    modelName: 'Attestation',
    tableName: 'Attestations',
    timestamps: false,
    paranoid: false
  });
  
  export default Attestation;
  
  