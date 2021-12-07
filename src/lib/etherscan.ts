import axios from 'axios';
import { URLSearchParams } from 'url';

class EtherscanAPI {
    private static apiKey?: string = process.env.ETHERSCAN_API_KEY;
    private static apiUrl: string = `https://api.etherscan.io`;

    constructor() {

    }

    static async getERC721Transactions(addresses: string[]) {
        let promises = EtherscanAPI.transactionsPromiseGenerator(addresses)
        let responses = await Promise.all(promises);
        let transactions = [];

        for(let response of responses) {
            transactions.push(...response.data.result);
        }

        return transactions;
    }

    private static transactionsPromiseGenerator(addresses: string[]){
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