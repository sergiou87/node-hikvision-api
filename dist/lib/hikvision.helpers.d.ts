import { HikVisionOptions, HikVisionPartialOptions } from '../types';
import { PutResponse } from '../responses';
export declare const parseOptions: (options: HikVisionPartialOptions) => HikVisionOptions;
export declare const buildDigestHeader: (authHeader: string, path: string, username: string, password: string) => string;
export declare const validatePutResponse: (response: PutResponse) => {
    success: boolean;
    response: PutResponse;
};
export declare const buildPathURL: (items: any[]) => string;
