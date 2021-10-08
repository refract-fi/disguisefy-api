import IToken from "../lib/interfaces/token";
import { DisguiseOptions } from "./disguise";
import Preset from "./preset";

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

        this.calcPercentages(options);

        if(options?.isGroupAssetsUnder) {
            Preset.groupAssets(this, options.groupAssetsUnder);
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
                    protocolImg: tokenDetails.protocolImg
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

    constructor(details: any) { // find more TS compliant solution
        if(details[0]) {
            this.percentage = details[0].balance;
            this.tokens = details[0].tokens || [];
            this.address = details[0].address;
            this.img = details[0].img || '';
            this.label = details[0].label;
            this.protocolImg = details[0].protocolImg;
        } else {
            //should not be used anymore
            this.percentage = details.balance;
            this.tokens = details.tokens;
            this.address = details.address;
            this.img = details.img || '';
            this.label = details.label;
            this.protocolImg = details.protocolImg;
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