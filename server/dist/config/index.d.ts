interface Config {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    frontendUrl: string;
    api: {
        url: string;
    };
    frontend: {
        url: string;
    };
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
        resetSecret: string;
        verifyEmailSecret: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    upload: {
        directory: string;
        maxSize: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    logging: {
        level: string;
        file: string;
    };
}
export declare const config: Config;
export {};
