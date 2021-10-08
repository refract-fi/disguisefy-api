import { Model, DataTypes } from 'sequelize';
import DatabaseManager from '../db';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

const refCIDKey = 'ref_cid';

interface AppSettingsAttributes {
    id: number;
    name?: string;
    value?: string;
}

class AppSettings extends Model<AppSettingsAttributes> {
    public id?: number;
    public name?: string | null;
    public value?: string | null;
};

AppSettings.init({
    id: {
        type: DataTypes.INTEGER,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db,
    modelName: 'AppSettings',
    timestamps: false,
    paranoid: false
});

export default AppSettings;