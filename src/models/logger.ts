import { Model, DataTypes } from 'sequelize';
import DatabaseManager from '../db';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

interface LogAttributes {
    id: number;
    level: string;
    url: string;
    status: string;
    message: string;
    timestamp: string;
}

class Logger extends Model<LogAttributes> {
    public id?: number;
    public level!: string;
    public url!: string;
    public status!: string;
    public message!: string;
    public timestamp!: string;

};


Logger.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      level: {
        type: DataTypes.STRING,
        allowNull: false
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
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false
      }
}, {
    sequelize: db,
    modelName: 'Logger',
    tableName: 'Logs',
    timestamps: false,
    paranoid: false
});

export default Logger;