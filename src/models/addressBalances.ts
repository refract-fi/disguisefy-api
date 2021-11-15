import IToken from "../lib/interfaces/token";
import { DisguiseOptions } from "./disguise";
import Preset from "./preset";

const ALL_CATEGORIES = '*';

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
        this.stats = {};

        if (options?.ignoreNFTs) {
            Preset.removeNFTs(this);
        }

        if (options?.assetCategories && options.assetCategories[0] != ALL_CATEGORIES) {
            Preset.removeCategories(this, options.assetCategories);
        }

        this.calcPercentages(options);
        this.calcStats(options)
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

    calcStats(options: DisguiseOptions | null) {

        let total: number = 0;
        let totalEth: number = 0;
        let totalMatic: number = 0;
        let totalFtm: number = 0;
        let totalxdai: number = 0;
        let totalBnb: number = 0;
        let totalCelo: number = 0;
        let totalOne: number = 0;
        let gasTokens = ['eth', 'matic', 'ftm', 'xdai', 'bnb', 'celo', 'one']

        Object.keys(this.balances).map(key => {
            if (key != 'debt') {
                total += isNaN(this.balances[key]) ? 0 : this.balances[key];
            }
        });
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
                default:
                    console.log("[ERROR]: invalid gas token: " + gasToken)
            }
        })

        this.stats = {
            ...this.stats,
            ethPercentage: totalEth / total * 100,
            maticPercentage: totalMatic / total * 100,
            ftmPercentage: totalFtm / total * 100,
            xdaiPercentage: totalxdai / total * 100,
            bnbPercentage: totalBnb / total * 100,
            celoPercentage: totalCelo / total * 100,
            onePercentage: totalOne / total * 100
            
        }
    }

    calcNetworkPercentages(options: DisguiseOptions | null){
        
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