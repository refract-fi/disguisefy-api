import * as dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';

import CoinGeckoApi from './lib/coingecko';

class CronManager {

    constructor() {
       
    }

    async run(schedule: string, taskName: string) {
        let task = cron.schedule(schedule, async () => {
            try {
                switch(taskName) {
                    case 'gasPriceUpdater':
                        await this.gasPriceUpdater();
                        break;
    
                    default:
                        console.log(`${taskName} not supported.`);
                        
                }

                task.start();
            } catch(e) {
                console.log(`${taskName} failed with following error: `, e);
            }
        });
    }

    private async gasPriceUpdater() {
        let result = await CoinGeckoApi.updateGasCoinsPrices();

        if(!result) {
            throw new Error(`CoinGeckoApi.updateGasCoinsPrices() failed.`)
        }
    }
}


export default CronManager;
 