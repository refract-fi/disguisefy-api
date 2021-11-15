import IToken from "./token";

export default interface IAsset {
    type: string;
    category: string;
    address: string;
    tokenAddress: string;
    label: string;
    symbol: string;
    img?: string;
    protocol?: string;
    appId?: string;
    collectionName?: string;
    collectionImg?: string;
    location?: any;
    decimals: number;
    protocolDisplay: string;
    balance: number;
    balanceUSD: number;
    tokens?: IToken[];
    network?: string;
}