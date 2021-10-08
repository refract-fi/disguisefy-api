declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            DB_HOST: string;
            DB_NAME: string;
            DB_USER: string;
            DB_PASS: string;
            DB_PORT: string;
            ZAPPERFI_API_KEY: string;
            REST_API_KEYS: string;
            WEB3_TOKEN: string;
            WEB3_CID: string;
        }
    }
}

export {}