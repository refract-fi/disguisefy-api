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
        let totalFailedTxs: number = 0
        let totalTxsCost: number = 0
        let totalERC721TxsCost: number = 0
        let totalFailedTxsCost: number = 0

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

                    let failedTxs = normalTxs.filter((tx: any) => tx.isError == '1')
                    
                    let normalTxsGasSpent: any
                    let erc721TxsGasSpent: any
                    let failedTxsGasSpent: any

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
                    if(failedTxs.length > 0){
                        totalFailedTxs += failedTxs.length
                        failedTxsGasSpent = await extractEtherscanGas(failedTxs)
                    } else {
                        failedTxsGasSpent = 0
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
                    if(failedTxs.length > 0){
                        totalFailedTxsCost += (failedTxsGasSpent * gasPrice)
                    }

                    txsStats[chain] = {
                        normalTxsAmount: normalTxs.length,
                        erc721TxsAmount: erc721Txs.length,
                        failedTxsAmount: failedTxs.length,
                        normalTxsGasSpent: normalTxsGasSpent,
                        erc721TxsGasSpent: erc721TxsGasSpent,
                        failedTxsGasSpent: failedTxsGasSpent,
                        normalTxGasCostUSD: (normalTxsGasSpent * gasPrice),
                        erc721TxGasCostUSD: (erc721TxsGasSpent * gasPrice),
                        failedTxsGasCostUSD: (failedTxsGasSpent * gasPrice),
                        gasPrice: gasPrice
                    }
                }
            }
            txsStats.totalTxs = totalTxs
            txsStats.totalERC721Txs = totalERC721Txs
            txsStats.totalFailedTxs = totalFailedTxs
            txsStats.totalTxsCost = totalTxsCost
            txsStats.totalERC721TxsCost = totalERC721TxsCost
            txsStats.totalFailedTxsCost = totalFailedTxsCost

            txsStats = {
                ...txsStats,
                gasSpentDistribution: {
                    ethereum : {
                        title: 'Ethereum',
                        color: "#ccaff8",
                        percentage: txsStats.ethereum.normalTxGasCostUSD/totalTxsCost * 100,
                        amount: txsStats.ethereum.normalTxGasCostUSD
                    },
                    polygon : {
                        title: 'Polygon',
                        color: "#8247e5",
                        percentage: txsStats.polygon.normalTxGasCostUSD/totalTxsCost * 100,
                        amount: txsStats.polygon.normalTxGasCostUSD
                    },
                    bsc: {
                        title: 'BSC',
                        color: '#FBDA3C',
                        percentage: txsStats['binance-smart-chain'].normalTxGasCostUSD/totalTxsCost * 100,
                        amount: txsStats['binance-smart-chain'].normalTxGasCostUSD
                    }
                },
                txsDistribution: {
                    ethereum : {
                        title: 'Ethereum',
                        color: "#ccaff8",
                        percentage: txsStats.ethereum.normalTxsAmount / totalTxs * 100,
                        amount: txsStats.ethereum.normalTxsAmount
                    },
                    polygon : {
                        title: 'Polygon',
                        color: "#8247e5",
                        percentage: txsStats.polygon.normalTxsAmount / totalTxs * 100,
                        amount: txsStats.polygon.normalTxsAmount
                    },
                    bsc: {
                        title: 'BSC',
                        color: '#FBDA3C',
                        percentage: txsStats['binance-smart-chain'].normalTxsAmount / totalTxs * 100,
                        amount: txsStats['binance-smart-chain'].normalTxsAmount
                    }
                }
            }

            if(txsStats.ethereum.normalTxsAmount < 1){
                delete txsStats.gasSpentDistribution.ethereum
                delete txsStats.txsDistribution.ethereum
            }
            if(txsStats.polygon.normalTxsAmount < 1){
                delete txsStats.gasSpentDistribution.polygon
                delete txsStats.txsDistribution.polygon
            }
            if(txsStats["binance-smart-chain"].normalTxsAmount < 1){
                delete txsStats.gasSpentDistribution.bsc
                delete txsStats.txsDistribution.bsc
            }
            
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