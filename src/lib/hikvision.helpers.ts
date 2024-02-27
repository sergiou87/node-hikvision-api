import * as crypto from 'crypto';
import { HikVisionOptions, HikVisionPartialOptions } from '../types';
import { PutResponse } from '../responses';

export const parseOptions = (
  options: HikVisionPartialOptions,
): HikVisionOptions => {
  const defaultOptions: HikVisionOptions = {
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

export const buildDigestHeader = (
  authHeader: string,
  path: string,
  username: string,
  password: string,
) => {
  const authDetails = authHeader.split(',').map((v: string) => v.split('='));

  let count = 0;

  ++count;
  const nonceCount = ('00000000' + count).slice(-8);
  const cnonce = crypto.randomBytes(24).toString('hex');
  const realm = authDetails
    .find((el: any) => el[0].toLowerCase().indexOf('realm') > -1)[1]
    .replace(/"/g, '');
  const nonce = authDetails
    .find((el: any) => el[0].toLowerCase().indexOf('nonce') > -1)[1]
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

  return (
    `Digest username="${username}",realm="${realm}",` +
    `nonce="${nonce}",uri="${path}",qop="auth",algorithm="MD5",` +
    `response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`
  );
};

export const validatePutResponse = (response: PutResponse) => {
  const success =
    response.statusCode === 1 &&
    response.statusString === 'OK' &&
    response.subStatusCode === 'ok';

  return {
    success,
    response,
  };
};

export const buildPathURL = (items: any[]) => {
  if (items.length > 0) return `/${items.join('/')}`;

  return '';
};
