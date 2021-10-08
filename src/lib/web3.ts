import { Web3Storage, File } from 'web3.storage';

class Web3Api {
    private token: string = process.env.WEB3_TOKEN;
    private web3Client: any;

    constructor() {
        this.web3Client = new Web3Storage({ token: this.token });
        return this.web3Client;
    }

    toFile(obj: object, name: string) {
        const buffer = Buffer.from(JSON.stringify(obj));
        return [new File([buffer], name)];
    }

    // use the url as the filename
    async store(obj: object, name: string) {
        const files = this.toFile(obj, name);
        const cid = await this.storeFile(files);
        return cid;
    }

    async storeFile(files: object) {
        const cid = await this.web3Client.put(files);
        console.log('stored files with cid:', cid)
        return cid;
    }
}

export default Web3Api;