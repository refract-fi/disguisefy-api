import { Web3Storage, File } from 'web3.storage';

class Web3Api {
    private token: string = process.env.WEB3_TOKEN || '';
    private cid: string = process.env.WEB3_CID|| '';
    private client: Web3Storage;

    constructor() {
        this.client = new Web3Storage({ token: this.token });
    }

    toFile(obj: object, name: string) {
        const buffer = Buffer.from(JSON.stringify(obj));
        return [new File([buffer], name)];
    }

    // use the url as the filename
    async store(obj: object, name: string) {
        const files = this.toFile(obj, name);
        const cid = await this.client.put(files)
        console.log(`cid: ${cid}`);
        return cid;
    }

    async listFiles(cid: string = '') {
        const res = await this.client.get(cid);
        const files = await res?.files();

        if(files && files.length > 0) {
            for(const file of files) {
                console.log(file);
            }
        } else {
            console.log(`cid contains no files.`);
        }
    }
}

export default Web3Api;