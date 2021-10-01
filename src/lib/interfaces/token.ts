export default interface IToken {
    address: string;
    symbol: string;
    reserve?: number;
    price?: number;
    balance?: number;
    balanceUSD?: number;
    balanceRaw?: number;
    tokens?: IToken[];
    img?: string;
    reserveRaw?: string;
    type?: string;
    decimals?: number;
    protocol?: string;
    label?: string;
    isCToken?: boolean;
    weight?: number;
    share?: number;
    supply?: number;
    volume?: number;
}