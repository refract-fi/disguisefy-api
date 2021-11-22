import { Model, DataTypes } from 'sequelize';
import { createNoSubstitutionTemplateLiteral } from 'typescript';
import DatabaseManager from '../db';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

interface LogAttributes {
    id: number;
    level: string;
    method: string;
    url: string;
    status: string;
    message: string;
    time: number;
    timestamp: string;
}

class Log extends Model<LogAttributes> {
    public id?: number;
    public level!: string;
    public method!: string;
    public url!: string;
    public status!: string;
    public message!: string;
    public time!: number;
    public timestamp!: string;

    static getLogger() {

    }
};

export class Logger {
  static handleRequest(a: any, b: any) {
    // ici logger
  }
};

Log.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      level: {
        type: DataTypes.STRING,
        allowNull: false
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true
      },
      time: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false
      }
}, {
    sequelize: db,
    modelName: 'Log',
    tableName: 'Logs',
    timestamps: false,
    paranoid: false
});

export default Log;