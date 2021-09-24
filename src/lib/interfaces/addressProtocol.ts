export default interface IAddressProtocol {
    products: IZapperProduct[];
    meta: IZapperProductMeta[];
}

interface IZapperProduct {
    label: string;
    assets: any[];
    meta?: any[]
}

interface IZapperProductMeta {
    label: string;
    value: number;
    type: string;
}