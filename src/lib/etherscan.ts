import axios from 'axios';
import { URLSearchParams } from 'url';
import { extractEtherscanGas, supportedBlockExplorers } from './helpers';
import { ILastTokensPrice } from './interfaces/transactionsAPI';

class EtherscanAPI {
    private static apiKey?: string = process.env.ETHERSCAN_API_KEY;
    private static apiUrl: string = `https://api.etherscan.io`;

    constructor() {

    }

    static async getTransactionsERC721Gas(addresses: string[], chains: string[]){
        let transactions = await EtherscanAPI.getTransactionsERC721(addresses, chains)

        let ERC721gas = await extractEtherscanGas(transactions)

        return ERC721gas
    }

    static async getTokenPrices(chains: string[]){
        let lastTokensPrice: ILastTokensPrice

        for(let chain in chains){
            if(supportedBlockExplorers.includes(chain) && chain !== 'fantom'){

            }
        }

    }



    static async getTransactionsERC721(addresses: string[], chains: string[]) {
        let promises = EtherscanAPI.transactionsPromiseGenerator(addresses, chains)
        let responses = await Promise.all(promises);
        let transactions = [];

        for(let response of responses) {
            transactions.push(...response.data.result);
        }

        return transactions;
    }

    private static transactionsPromiseGenerator(addresses: string[], chains: string[]){
        let promises = [];
        
        for(let address of addresses) {
            let params = new URLSearchParams();
            params.append('module', 'account')
            params.append('action', 'tokennfttx')
            params.append('address', address);
            params.append('sort', 'asc')
            params.append('apikey', 'EXDKBSCMNMMJB4B6B9EJYHENTWEIK5N3WZ');
            let url = `${EtherscanAPI.apiUrl}/api?` + params.toString();
            promises.push(axios.get(url));            
        }
        return promises
    }
}

export default EtherscanAPI;