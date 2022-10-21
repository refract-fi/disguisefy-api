'use strict';

// https://github.com/dwkerwin/koa-apikey/blob/master/lib/koa-apikey.js
// could not find TS compatible version

function findApiKeyFromRequest(headers: any, query: any) {
    if (!headers) headers = {};
    if (!query) query = {};

    return headers['x-apikey']
    || headers['x-api-key']
    || headers['apikey']
    || query['api-key']
    || query['apikey'];
}

function getApiKeysFromEnvironment(apiKeyServerEnvironmentVariableName: any) {
    const envvarName = apiKeyServerEnvironmentVariableName;
    const apikeys = process.env[envvarName] || '';
    return apikeys.split(',')
}

const koaApikey = function (options: object = {}) {
    const defaultOptions = {
        apiKeyServerEnvironmentVariableName: 'REST_API_KEYS',
// @ts-ignore: Not my package
        unprotectedRoutes: []
    };
    options = Object.assign({}, defaultOptions, options);

    const middleware = async (ctx: any, next: any) => {
        let isUnprotectedRoute = false;
        // @ts-ignore: Not my package
        if (options.unprotectedRoutes) {
            const pathWithoutQuerystring = ctx.request.url.split('?')[0]
            // @ts-ignore: Not my package
            for (let unprotectedRoute of options.unprotectedRoutes) {
                if (pathWithoutQuerystring == unprotectedRoute) {
                    isUnprotectedRoute = true;
                    break;
                }
            }
        }
        if (!isUnprotectedRoute) {
            const apikeyFromRequest = findApiKeyFromRequest(ctx.request.headers, ctx.request.query);
            // @ts-ignore: Not my package
            const apiKeysFromEnvironment = getApiKeysFromEnvironment(options.apiKeyServerEnvironmentVariableName);
            ctx.assert(apiKeysFromEnvironment.includes(apikeyFromRequest), 401);
        }
        await next();
    };
    middleware._name = 'koa-apikey';
    return middleware;
};

export default koaApikey;