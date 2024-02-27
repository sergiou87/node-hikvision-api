"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPathURL = exports.validatePutResponse = exports.buildDigestHeader = exports.parseOptions = void 0;
const crypto = require("crypto");
const parseOptions = (options) => {
    const defaultOptions = {
        host: '',
        port: 80,
        protocol: 'http',
        username: '',
        password: '',
        debug: false,
        reconnectAfter: 30000,
        logger: console.log,
    };
    return {
        username: options.username,
        password: options.password,
        debug: options.debug || defaultOptions.debug || false,
        host: options.host,
        port: parseInt(`${options.port || defaultOptions.port}`),
        protocol: options.protocol || defaultOptions.protocol,
        reconnectAfter: options.reconnectAfter || defaultOptions.reconnectAfter,
        logger: options.logger || defaultOptions.logger,
    };
};
exports.parseOptions = parseOptions;
const buildDigestHeader = (authHeader, path, username, password) => {
    const authDetails = authHeader.split(',').map((v) => v.split('='));
    let count = 0;
    ++count;
    const nonceCount = ('00000000' + count).slice(-8);
    const cnonce = crypto.randomBytes(24).toString('hex');
    const realm = authDetails
        .find((el) => el[0].toLowerCase().indexOf('realm') > -1)[1]
        .replace(/"/g, '');
    const nonce = authDetails
        .find((el) => el[0].toLowerCase().indexOf('nonce') > -1)[1]
        .replace(/"/g, '');
    const ha1 = crypto
        .createHash('md5')
        .update(`${username}:${realm}:${password}`)
        .digest('hex');
    const ha2 = crypto.createHash('md5').update(`GET:${path}`).digest('hex');
    const response = crypto
        .createHash('md5')
        .update(`${ha1}:${nonce}:${nonceCount}:${cnonce}:auth:${ha2}`)
        .digest('hex');
    return (`Digest username="${username}",realm="${realm}",` +
        `nonce="${nonce}",uri="${path}",qop="auth",algorithm="MD5",` +
        `response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`);
};
exports.buildDigestHeader = buildDigestHeader;
const validatePutResponse = (response) => {
    const success = response.statusCode === 1 &&
        response.statusString === 'OK' &&
        response.subStatusCode === 'ok';
    return {
        success,
        response,
    };
};
exports.validatePutResponse = validatePutResponse;
const buildPathURL = (items) => {
    if (items.length > 0)
        return `/${items.join('/')}`;
    return '';
};
exports.buildPathURL = buildPathURL;
