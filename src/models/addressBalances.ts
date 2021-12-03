import IToken from "../lib/interfaces/token";
import { DisguiseOptions } from "./disguise";
import Preset from "./preset";

const ALL_CATEGORIES = 'all';

export default class AddressBalances {
    balances: IPercentages;
    percentages: IPercentages;
    assets: object; // find more TS compliant solution
    assetsPercentages: IAssetPercentages;
    stats: object;

    constructor(balances: IPercentages, assets: object, options: DisguiseOptions | null) {
        this.balances = balances;
        this.percentages = {};
        this.assets = assets;
        this.assetsPercentages = {};
        this.stats = {
            gasTokenPercentages: {}
        };

        if (options?.ignoreNFTs) {
            Preset.removeNFTs(this);
        }

        if (options?.assetCategories && options.assetCategories[0] != ALL_CATEGORIES) {
            Preset.removeCategories(this, options.assetCategories);
        }

        let totalWithoutNFTs: number = 0;
        Object.keys(this.balances).map(key => {
            if (key != 'debt' && key != 'nft') {
                totalWithoutNFTs += isNaN(this.balances[key]) ? 0 : this.balances[key];
            }
        });

        this.calcPercentages(options);
        this.calcStats(options, totalWithoutNFTs);

        if (options?.isGroupAssetsUnder) {
            Preset.groupAssets(this, options.groupAssetsUnder);
        }
        
        this.groupAssetsByLabel()
    }

    groupAssetsByLabel() {
        let marked: string[] = [];

        for (let [assetCategory, assetsList] of Object.entries(this.assetsPercentages)) {
            let assets = Object.values(assetsList);
            for (let [assetAddress, currentAsset] of Object.entries(assetsList)) {
                if(assetCategory !== 'wallet'){
                    // prevents similar assets to delete each other
                    if (!marked.includes(currentAsset.address)) {
                        // find asset with same label but different address, likely similar asset ported to an other chain
                        let similarAssetIndex = assets.findIndex(asset => asset.label == currentAsset.label && asset.address != currentAsset.address);
                        
                        if (similarAssetIndex > -1) {
                            currentAsset.percentage += assets[similarAssetIndex].percentage;
                            marked.push(assets[similarAssetIndex].address);
                            delete this.assetsPercentages[assetCategory][assets[similarAssetIndex].address];
                        }
                    }
                } else {
                    if(!marked.includes(currentAsset.address)){
                        let similarAssetIndex = assets.findIndex(asset => asset.label == currentAsset.label && asset.address !== currentAsset.address)
                        if(similarAssetIndex > -1){
                            currentAsset.percentage += assets[similarAssetIndex].percentage;
                            marked.push(assets[similarAssetIndex].address);
                            delete this.assetsPercentages[assetCategory][`${assets[similarAssetIndex].label}-${assets[similarAssetIndex].network}`]
                        }
                    }
                }
            }

        }
    }

    calcPercentages(options: DisguiseOptions | null) {
        let total: number = 0;
        Object.keys(this.balances).map(key => {
            if (key != 'debt') {
                total += isNaN(this.balances[key]) ? 0 : this.balances[key];
            }
        });

        for (let [key, value] of Object.entries(this.balances)) {
            if (key != 'undefined') {
                this.percentages[key] = value == 0 ? 0 : (Math.abs(value) / total) * 100;
            }
        }

        for (let [category, assetList] of Object.entries(this.assets)) {
            for (let [token, details] of Object.entries(assetList)) {
                let tokenDetails = new TokenDetails(details);

                if (!this.assetsPercentages.hasOwnProperty(category)) {
                    this.assetsPercentages[category] = {};
                }

                this.assetsPercentages[category][token] = {
                    percentage: tokenDetails.percentage == 0 ? 0 : (tokenDetails.percentage / total) * 100,
                    tokens: tokenDetails.tokens,
                    address: tokenDetails.address,
                    img: tokenDetails.img,
                    label: tokenDetails.label,
                    protocolImg: tokenDetails.protocolImg,
                    network: tokenDetails.network
                };
            }
        }
    }

    calcStats(options: DisguiseOptions | null, total: number){

        this.calcGasPercentages(options, total)
        this.calcNetworkPercentages(options);
        this.calcProtocolPercentages(options, total);
        this.calcImpermanentVulnerability(options);
    }

    calcGasPercentages(options: DisguiseOptions | null, total: number) {

        let totalEth: number = 0;
        let totalMatic: number = 0;
        let totalFtm: number = 0;
        let totalxdai: number = 0;
        let totalBnb: number = 0;
        let totalCelo: number = 0;
        let totalOne: number = 0;
        let totalOther: number = 0;
        let gasTokens = ['eth', 'matic', 'ftm', 'xdai', 'bnb', 'celo', 'one', 'other']

        gasTokens.map((gasToken) => {
            let totalGasToken: number = 0;
            for (let [category, assetList] of Object.entries(this.assets)) {
                if (category !== 'debt' && category !== 'nft') {
                    for (let [token, details] of (Object.entries(assetList))) {
                        let detailsArray: any = details
                        let tokenDetails: any = new TokenDetails(details)
                        if (detailsArray.length > 1) {
                            //This works for wallet assets with same address, will need to check also for other types
                            detailsArray.map((detail: any) => {
                                if (detail.symbol.toLowerCase().includes(`${gasToken}`) || detail.symbol.toLowerCase().includes(`w${gasToken}`)) {
                                    totalGasToken += detail.balance
                                }
                            })
                        } else if (tokenDetails?.tokens[0]?.category === 'pool') {
                            tokenDetails.tokens[0].tokens.map((token: any) => {
                                if (token.symbol.toLowerCase().includes(`${gasToken}`) || token.symbol.toLowerCase().includes(`w${gasToken}`)) {
                                    totalGasToken += token.balanceUSD
                                }
                            })
                        } else if (tokenDetails?.tokens[0]?.type === 'base') {
                            tokenDetails?.tokens.map((token: any) => {
                                if (token.symbol.toLowerCase().includes(`${gasToken}`) || token.symbol.toLowerCase().includes(`w${gasToken}`)) {
                                    totalGasToken += token.balanceUSD
                                }
                            })
                        } else if (tokenDetails.label.toLowerCase().includes(`${gasToken}`) || tokenDetails.label.toLowerCase().includes(`w${gasToken}`)) {
                            totalGasToken += tokenDetails.percentage
                        } else {

                        }
                    }
                }
            }
            switch (gasToken) {
                case "eth":
                    totalEth = totalGasToken
                    break;
                case "matic":
                    totalMatic = totalGasToken
                    break;
                case "ftm":
                    totalFtm = totalGasToken
                    break;
                case "xdai":
                    totalxdai = totalGasToken
                    break;
                case "bnb":
                    totalBnb = totalGasToken
                    break;
                case "celo":
                    totalCelo = totalGasToken
                    break;
                case "one":
                    totalOne = totalGasToken
                    break;
                case "other":
                    totalOther = total - (totalEth + totalMatic + totalFtm + totalxdai + totalBnb + totalCelo + totalOne)
                    break;
                default:
                    console.log("[ERROR]: invalid gas token: " + gasToken)
            }
        })

        this.stats = {
            ...this.stats,
            gasTokenPercentages: {
                eth: {
                    title: 'ETH',
                    color: '#ccaff8',
                    percentage: totalEth / total * 100
                },
                matic: {
                    title: 'MATIC',
                    color: "#8247e5",
                    percentage: totalMatic / total * 100
                },
                ftm: {
                    title: 'FTM',
                    color: "#0150e3",
                    percentage: totalFtm / total * 100
                },
                xdai: {
                    title: 'XDAI',
                    color: "#f6c14d",
                    percentage:totalxdai / total * 100
                },
                bnb: {
                    title: 'BNB',
                    color: "#FBDA3C",
                    percentage: totalBnb / total * 100
                },
                celo: {
                    title: 'CELO',
                    color: '#5ace82',
                    percentage: totalCelo / total * 100
                },
                one: {
                    title: 'ONE',
                    color: '#40a9e6',
                    percentage: totalOne / total * 100
                },
                other: {
                    title: 'Other Assets',
                    color: '#ecf3ff',
                    percentage: totalOther / total * 100
                }
            }
        }

        if(totalEth / total * 100 <= 0.1){
            totalOther += totalEth / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.eth
        }
        if(totalMatic / total * 100 <= 0.1){
            totalOther += totalMatic / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.matic
        }
        if(totalFtm / total * 100 <= 0.1){
            totalOther += totalFtm / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.ftm
        }
        if(totalxdai / total * 100 <= 0.1){
            totalOther += totalxdai / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.xdai
        }
        if(totalBnb / total * 100 <= 0.1){
            totalOther += totalBnb / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.bnb
        }
        if(totalCelo / total * 100 <= 0.1){
            totalOther += totalCelo / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.celo
        }
        if(totalOne / total * 100 <= 0.1){
            totalOther += totalOne / total * 100
            //@ts-ignore
            delete this.stats.gasTokenPercentages.one
        }
        if(totalOther / total * 100 <= 0.1){
            //@ts-ignore
            delete this.stats.gasTokenPercentages.other
        }
    }

    calcNetworkPercentages(options: DisguiseOptions | null) {
        let networkTotals: any = {}
        let total: any = 0
        let networkPercentages: any = {
            ethereum : {
                title: 'Ethereum',
                color: "#ccaff8",
                percentage: 0
            },
            polygon : {
                title: 'Polygon',
                color: "#8247e5",
                percentage: 0
            },
            fantom: {
                title: 'Fantom',
                color: '#0150e3',
                percentage: 0
            },
            "binance-smart-chain": {
                title: 'BSC',
                color: '#FBDA3C',
                percentage: 0
            },
            optimism: {
                title: 'Optimism',
                color: '#ff0420',
                percentage: 0
            },
            xdai: {
                title: 'xDai',
                color: '#f6c14d',
                percentage: 0
            },
            avalanche: {
                title: 'Avalanche',
                color: '#e84142',
                percentage: 0
            },
            arbitrum: {
                title: 'Arbitrum',
                color: '#28a0f0',
                percentage: 0
            },
            celo: {
                title: 'Celo',
                color: '#5ace82',
                percentage: 0
            },
            harmony: {
                title: 'Harmony',
                color: '#40a9e6',
                percentage: 0
            },
            other: {
                title: 'Other Networks',
                color: 'white',
                percentage: 0,
                // networks: []
            },
        }
        for (let [category, assetList] of Object.entries(this.assets)) {
            if ((category !== 'debt' && category !== 'nft')) {
                for (let [token, details] of (Object.entries(assetList))) {
                    let detailsArray: any = details
                    detailsArray.map((asset: any) => {
                        if(!networkTotals[asset.network]){
                            networkTotals[asset.network] = 0
                        }
                        networkTotals[asset.network] += asset.balance
                        total += asset.balance
                    })
                }
            }
        }
        let otherTotal: number = 0
        for(let [network, networkTotal] of Object.entries(networkTotals)){
            let networkAmount: any = networkTotal
            if(networkAmount / total * 100 > 0.1){
                networkPercentages[network].percentage = networkAmount / total * 100
            } else {
                otherTotal += networkAmount / total * 100
                // networkPercentages.other.networks.push(network)
            }
        }
        networkPercentages.other.percentage = otherTotal
        for(let [network, networkDetails] of Object.entries(networkPercentages)){
            //@ts-ignore
            if(networkDetails.percentage === 0){
                delete networkPercentages[network]
            }
        }

        this.stats = {
            ...this.stats,
            networkPercentages: networkPercentages
        }
    }
    calcProtocolPercentages(options: DisguiseOptions | null, total: number) {
        let protocolBalances: any = {}
        let protocolPercentages: any = {}

        for (let [category, assetList] of Object.entries(this.assets)) {
            if (category !== 'debt' && category !== 'nft') {
                for (let [token, details] of (Object.entries(assetList))) {
                    let detailsArray: any = details
                    detailsArray.map((asset: any) => {
                        if(!protocolBalances[asset.protocol]){
                            if(asset.protocol === 'wallet'){
                                // protocolBalances.wallet = 0
                            } else {
                                console.log(asset.productLabel)
                                protocolBalances[asset.protocol] = 0
                                protocolPercentages = {...protocolPercentages, [asset.protocol]: {percentage: 0, title: asset.productLabel}}
                            }
                        }
                        if(asset.protocol === 'wallet'){
                            // protocolBalances.wallet += asset.balance
                        }else {
                            protocolBalances[asset.protocol] += asset.balance
                            // let newBalance: number = protocolBalances[asset.protocol].balance + asset.balance
                            // protocolPercentages = {...protocolPercentages, [asset.protocol]: {...[asset.protocol], percentage: 0}}
                            // total += asset.balance
                        }
                    })
                }
            }
        }
        let notLocked: number = 100
        let otherPercent: number = 0

        for(let [protocol, balance] of Object.entries(protocolBalances)){
            let bal: any = balance
            notLocked -= bal/total * 100
            if(bal/total * 100 >= 0.1){
                protocolPercentages[protocol].percentage = bal/total * 100
            }else{
                otherPercent += bal/total * 100
                delete protocolPercentages[protocol]
            }
            // protocolPercentages[protocol] =  bal/total * 100
        }

        // protocolPercentages.otherPercent = otherPercent
        protocolPercentages.other = {
            title: 'Other Assets Locked',
            percentage: otherPercent
        }

        protocolPercentages.notLocked = {
            title: 'Not locked in a protocol',
            percentage: notLocked,
            color: 'white'
        }
        
        this.stats = {
            ...this.stats,
            // protocolPercentages: protocolPercentages,
            protocolPercentages: protocolPercentages
        }
        
    }

    calcImpermanentVulnerability(options: DisguiseOptions | null) {

    }
}

class TokenDetails {
    percentage: number;
    tokens: IToken[];
    address: string;
    img?: string;
    protocolImg?: string;
    label: string;
    network?: string;
    balance?: number;

    constructor(details: any) { // find more TS compliant solution
        if (details[0]) {
            this.percentage = details[0].balance;
            this.tokens = details[0].tokens || [];
            this.address = details[0].address;
            this.img = details[0].img || '';
            this.label = details[0].label;
            this.protocolImg = details[0].protocolImg;
            this.network = details[0].network;
        } else {
            //should not be used anymore
            this.percentage = details.balance;
            this.tokens = details.tokens;
            this.address = details.address;
            this.img = details.img || '';
            this.label = details.label;
            this.protocolImg = details.protocolImg;
            this.network = details.network;
        }
    }
}

interface IPercentages {
    [key: string]: number;
}

interface IDetailedPercentages {
    [key: string]: TokenDetails;
}

interface IAssetPercentages {
    [key: string]: IDetailedPercentages;
}