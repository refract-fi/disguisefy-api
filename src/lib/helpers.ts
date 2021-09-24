import IAsset from "./interfaces/asset";
import IToken from "./interfaces/token";

const imgBase = 'https://storage.googleapis.com/zapper-fi-assets/tokens';

export enum AssetCategories {
    notUsed = 'notUsed',
    wallet = 'wallet',
    deposit = 'deposit',
    investment = 'investment',
    pool = 'pool',
    staking = 'staking',
    claimable = 'claimable',
    debt = 'debt',
    nft = 'nft',
    other = 'others'
};

const emptyBalances = {
    [AssetCategories.notUsed]: 0,
    [AssetCategories.wallet]: 0,
    [AssetCategories.deposit]: 0,
    [AssetCategories.investment]: 0,
    [AssetCategories.pool]: 0,
    [AssetCategories.staking]: 0,
    [AssetCategories.claimable]: 0,
    [AssetCategories.debt]: 0,
    [AssetCategories.nft]: 0,
    [AssetCategories.other]: 0
};

const emptyAssets = JSON.stringify({
    [AssetCategories.notUsed]: {},
    [AssetCategories.wallet]: {},
    [AssetCategories.deposit]: {},
    [AssetCategories.investment]: {},
    [AssetCategories.pool]: {},
    [AssetCategories.staking]: {},
    [AssetCategories.claimable]: {},
    [AssetCategories.debt]: {},
    [AssetCategories.nft]: {},
    [AssetCategories.other]: {}
});

export function getAssetCategories(x = 'wallet'): AssetCategories {
    return (<any>AssetCategories)[x];
}

export function getEmptyBalances() {
    return Object.assign({}, emptyBalances);
}

export function getEmptyAssets() {
    // for deeper copy https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
    return Object.assign({}, JSON.parse(emptyAssets));
}

export function addAsset(assets: any, assetCategory: AssetCategories, asset: IAsset) {
    let key = String(assetCategory);
    let tokens: IToken[] = extractTokens(asset);

    if(assets[key].hasOwnProperty(asset.symbol)) {
        assets[key][asset.symbol]['balance'] += asset.balanceUSD;
    } else {
        assets[key][asset.symbol] = {
            balance: asset.balanceUSD,
            tokens: tokens,
            address: asset.address
        };
    }
}

// asset should be IAsset | IToken
export function extractTokens(asset: any): IToken[] {
    let tokens: IToken[] = [];
    if(asset.tokens) {
        if(asset.tokens[0].tokens) {
             // pools may have an array of tokens in the asset
            tokens = extractTokens(asset.tokens[0]);
        } else {
            for(let token of asset.tokens) {
                // clean up the token content
                delete token.reserve;
                delete token.price;
                delete token.balance;
                delete token.balanceUSD;
                delete token.balanceRaw;
                delete token.reserveRaw;
                delete token.type;
                delete token.decimals;
                delete token.isCToken;
                delete token.weight;
    
                token.img = extractAssetImg(token, asset.type)
                tokens.push(token);
            }
        }
    } else {
        tokens.push({
            address: asset.address,
            symbol: asset.symbol,
            img: extractAssetImg(asset, asset.type)
        });
    }

    return tokens;
}

// asset should be IAsset | IToken
export function extractAssetImg(asset: any, assetCategory: string) {
    let img = null;

    if(asset.img && asset.img != '') {
        if(assetCategory != AssetCategories.nft) {
            img = asset.img;
        }
    } else {
        if(assetCategory != AssetCategories.nft) {
            img = `${imgBase}/ethereum/${asset.address}.png`; // network should be dynamic
        }
    }

    return img;
}