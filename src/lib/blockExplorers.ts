import axios from "axios";
import { URLSearchParams } from 'url';
import { blockExplorers, extractEtherscanGas, extractZapperGas, supportedBlockExplorers, timeout } from "./helpers";
import ZapperApi from "./zapperfi";

class BlockExplorersAPI {
    private static API = blockExplorers
    private static supportedAPIs = supportedBlockExplorers

    constructor() {

    }

    static async getTxsStats(addresses: string[], chains: string[]) {
        let txsStats: any = {}
        let totalTxs: number = 0
        let totalERC721Txs: number = 0
        let totalTxsCost: number = 0
        let totalERC721TxsCost: number = 0

        try{
            for (let chain of chains) {
                if (BlockExplorersAPI.supportedAPIs.includes(chain)) {
                    //@ts-ignore
                    let apiUrl: string = BlockExplorersAPI.API[chain].apiUrl
                    //@ts-ignore
                    let apiKey: string = BlockExplorersAPI.API[chain].apiKey
                    //@ts-ignore
                    let apiKey2: string = BlockExplorersAPI.API[chain].apiKey2
                    
                    let normalTxs = await BlockExplorersAPI.getNormalTxs(addresses, apiUrl, apiKey)
                    await timeout(1000);
                    // let normalTxs = await ZapperApi.getNormalTxs(addresses, chain)
                    let erc721Txs = await BlockExplorersAPI.getERC721Txs(addresses, apiUrl, apiKey)
                    
                    let normalTxsGasSpent: any
                    let erc721TxsGasSpent: any
                    let gasPrice: any
                    if(normalTxs.length > 0){
                        totalTxs += normalTxs.length
                        // normalTxsGasSpent = await extractEtherscanGas(normalTxs)
                        normalTxsGasSpent = await extractEtherscanGas(normalTxs)
                    } else {
                        normalTxsGasSpent = 0
                    }
                    if(erc721Txs.length > 0){
                        totalERC721Txs += erc721Txs.length
                        erc721TxsGasSpent = await extractEtherscanGas(erc721Txs)
                    } else {
                        erc721TxsGasSpent = 0
                    }
                    
                    
                    if(chain !== 'fantom'){
                        gasPrice = await BlockExplorersAPI.getGasTokenLastPrice(apiKey2, apiUrl, chain)
                        gasPrice = parseFloat(gasPrice)
                    } else{
                        gasPrice = 1.59
                    }
                    
                    if(erc721Txs.length > 0){
                        totalERC721TxsCost += (erc721TxsGasSpent * gasPrice)
                    }
                    if(normalTxs.length > 0){
                        totalTxsCost += (normalTxsGasSpent * gasPrice)
                    }

                    txsStats[chain] = {
                        normalTxsAmount: normalTxs.length,
                        erc721TxsAmount: erc721Txs.length,
                        normalTxsGasSpent: normalTxsGasSpent,
                        erc721TxsGasSpent: erc721TxsGasSpent,
                        normalTxGasCostUSD: (normalTxsGasSpent * gasPrice),
                        erc721TxGasCostUSD: (erc721TxsGasSpent * gasPrice),
                        gasPrice: gasPrice
                    }
                }
            }
            txsStats.totalTxs = totalTxs
            txsStats.totalERC721Txs = totalERC721Txs
            txsStats.totalTxsCost = totalTxsCost
            txsStats.totalERC721TxsCost = totalERC721TxsCost
            
            return txsStats
        }catch(e){
            console.log(e)
        }
        }
        
    static async getNormalTxs(addresses: string[], apiUrl: string, apiKey: string) {
        let promises = BlockExplorersAPI.transactionPromiseGenerator(addresses,'txlist', apiUrl, apiKey)
        let responses = await Promise.all(promises);
        let normalTxs: Array<any> = []

        for(let response of responses){
            normalTxs.push(...response.data.result)
        }

        return normalTxs

    }

    static async getERC721Txs(addresses: string[], apiUrl: string, apiKey: string) {
        let promises = BlockExplorersAPI.transactionPromiseGenerator(addresses, 'tokennfttx', apiUrl, apiKey)
        let responses = await Promise.all(promises);
        let erc721Txs: Array<any> = []

        for(let response of responses){
            erc721Txs.push(...response.data.result)
        }

        return erc721Txs

    }

    static async getGasTokenLastPrice(apiKey: string, apiUrl: string, chain: string) {
        let gasPriceUSD: number = 0

        //@ts-ignore
        let action = BlockExplorersAPI.API[chain].priceAction

        let params = new URLSearchParams();
        params.append('module', 'stats')
        params.append('action', action)
        params.append('apikey', apiKey)
        let url = `${apiUrl}/api?` + params.toString();
        let response: any = await axios.get(url)
        if(chain === 'ethereum' || chain === 'binance-smart-chain'){
            gasPriceUSD = response.data.result.ethusd
        } else if(chain === 'polygon'){
            gasPriceUSD = response.data.result.maticusd
        }

        return gasPriceUSD
    }

    private static transactionPromiseGenerator(addresses: string[], action: string, apiUrl: string, apiKey: string){
        let promises = []
        
        for(let address of addresses){
            let params = new URLSearchParams();
            params.append('module', 'account')
            params.append('action', action)
            params.append('address', address);
            params.append('sort', 'asc')
            params.append('apikey', apiKey);
            let url = `${apiUrl}/api?` + params.toString();
            promises.push(axios.get(url));   
        }
        return promises
    }
}

export default BlockExplorersAPI