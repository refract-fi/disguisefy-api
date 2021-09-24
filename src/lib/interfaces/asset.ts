import IToken from "./token";

export default interface IAsset {
    type: string;
    address: string;
    tokenAddress: string;
    label: string;
    symbol: string;
    img?: string;
    decimals: number;
    protocolDisplay: string;
    balance: number;
    balanceUSD: number;
    tokens?: IToken[];
}