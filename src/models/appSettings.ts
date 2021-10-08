import { Model, DataTypes } from 'sequelize';
import DatabaseManager from '../db';

const dbManager = DatabaseManager.getInstance();
const db = dbManager.getSequelize();

interface AppSettingsAttributes {
    id: number;
    name: string;
    value?: string;
}

class AppSettings extends Model<AppSettingsAttributes> {
    public id?: number;
    public name!: string;
    public value!: string;
    public static REF_CID_KEY = 'ref_cid';

    static async getCID(): Promise<string> {
        try {
            let appSetting = await AppSettings.findOne({
                where: {
                    name: AppSettings.REF_CID_KEY
                }
            });

            if(appSetting) {
                return appSetting.value;
            } else {
                throw new Error('No appSetting for ref_cid');
            }
        } catch(e) {
            console.log(e);
            return '';
        }
    }
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