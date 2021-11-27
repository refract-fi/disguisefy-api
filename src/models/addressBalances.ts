import IToken from "../lib/interfaces/token";
import { DisguiseOptions } from "./disguise";
import Preset from "./preset";

const ALL_CATEGORIES = 'all';

export default class AddressBalances {
    balances: IPercentages;
    percentages: IPercentages;
    assets: object; // find more TS compliant solution
    assetsPercentages: IAssetPercentages;

    constructor(balances: IPercentages, assets: object, options: DisguiseOptions | null) {
        this.balances = balances;
        this.percentages = {};
        this.assets = assets;
        this.assetsPercentages = {};

        if(options?.ignoreNFTs) {
            Preset.removeNFTs(this);
        }

        if(options?.assetCategories && options.assetCategories[0] != ALL_CATEGORIES) {
            Preset.removeCategories(this, options.assetCategories);
        }
        
        this.calcPercentages(options);

        if(options?.isGroupAssetsUnder) {
            Preset.groupAssets(this, options.groupAssetsUnder);
        }
        
        this.groupAssetsByLabel()
    }

    groupAssetsByLabel() {
        let marked: string[] = [];

        for(let [assetCategory, assetsList] of Object.entries(this.assetsPercentages)) {
            let assets = Object.values(assetsList);
            for(let [assetAddress, currentAsset] of Object.entries(assetsList)) {
                // prevents similar assets to delete each other
                if(!marked.includes(currentAsset.address)) {
                    // find asset with same label but different address, likely similar asset ported to an other chain
                    let similarAssetIndex = assets.findIndex(asset => asset.label == currentAsset.label && asset.address != currentAsset.address );
    
                    if(similarAssetIndex > -1) {
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
            if(key != 'debt') {
                total += isNaN(this.balances[key]) ? 0 : this.balances[key];
            }
        });

        for(let [key, value] of Object.entries(this.balances)) {
            if(key != 'undefined') {
                this.percentages[key] = value == 0 ? 0 : (Math.abs(value) / total) * 100;
            }
        }

        for(let [category, assetList] of Object.entries(this.assets)) {
            for(let [token, details] of Object.entries(assetList)) {
                let tokenDetails = new TokenDetails(details);
                
                if(!this.assetsPercentages.hasOwnProperty(category)) {
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
        if(details[0]) {
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