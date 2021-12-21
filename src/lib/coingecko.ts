import axios from 'axios';
import moment from 'moment';
import { URLSearchParams } from 'url';

import Price from '../models/price';

const NETWORK_GAS_COINS = {
    "ethereum": { "id": "ethereum", "symbol": "eth", "name": "Ethereum" },
    "polygon": { "id": "matic-network", "symbol": "matic", "name": "Polygon" },
    "binance-smart-chain": { "id": "binancecoin", "symbol": "bnb", "name": "Binance Coin"},
    "fantom": { "id": "fantom", "symbol": "ftm", "name": "Fantom" }
};

class CoinGeckoApi {
    private static apiUrl: string = `https://api.coingecko.com/api/v3`;
    private static sourceIdentifier: string = 'coingecko';

    constructor() {

    }

    static async getCoinsList() {
        const url = `${CoinGeckoApi.apiUrl}/coins/list`;

        try {
            let response = await axios.get(url);

            return response?.data || []; 
        } catch(e) {
            console.log(e);
            return new Error("Coin Gecko did not return expected list.")
        }
    }

    // static async getCoinPrice(coinIdentifiers: string[]) {

    // }

    static async getGasCoinsPrices() {
        let params = new URLSearchParams();
        let coinsIdentifiers: string[] = [];

        for(let [network, gasCoin] of Object.entries(NETWORK_GAS_COINS)) {
            coinsIdentifiers.push(gasCoin.id);
        }

        params.append('vs_currencies', 'usd');
        params.append('ids', coinsIdentifiers.join(','));

        const url = `${CoinGeckoApi.apiUrl}/simple/price?` + params.toString();

        try {
            let response = await axios.get(url);

            return response.data;
        } catch(e) {
            console.log(e);
            return new Error("Coin Gecko did not return expected list.")
        }
    }

    static async initGasCoinsPrices() {
        let status = false;

        try {
            let gasCoinsPrices = await CoinGeckoApi.getGasCoinsPrices();
            
            for(let [network, gasCoin] of Object.entries(NETWORK_GAS_COINS)) {
                let gasCoinPrice = null;
                
                for(let [id, price] of Object.entries(gasCoinsPrices)) {
                    if(gasCoin.id == id) {
                        // @ts-ignore
                        gasCoinPrice = price.usd;
                    }
                }
                
                await Price.create({
                    symbol: gasCoin.symbol,
                    label: gasCoin.name,
                    network: network,
                    isGas: true,
                    address: null,
                    priceUSD: gasCoinPrice,
                    source: CoinGeckoApi.sourceIdentifier,
                    sourceIdentifier: gasCoin.id,
                    updatedAt: moment().unix(),
                    updatedAtDisplay: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                    symbolDisplay: null,
                    labelDisplay: null,
                    networkDisplay: null
                });
            }
            
            status = true;
        } catch(e) {
            console.log('Could not initialize coin prices.')
            console.log(e);
        } finally {
            return status;
        }
    }

    static async updateGasCoinsPrices() {
        let status  = false;

        try {
            let updatedGasCoinsPrices = await CoinGeckoApi.getGasCoinsPrices();

            for(let [network, price] of Object.entries(updatedGasCoinsPrices)) {
                // @ts-ignore
                let newPrice = parseFloat(price.usd);

                await Price.update({
                    priceUSD: newPrice,
                    updatedAt: moment().unix(),
                    updatedAtDisplay: moment.utc().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: { sourceIdentifier: network }
                });
            }
            
            status = true;
        } catch(e) {
            console.log('Could not initialize coin prices.')
            console.log(e);
        } finally {
            return status;
        }
    }
}

export default CoinGeckoApi;