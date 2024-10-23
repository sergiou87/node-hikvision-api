import { StreamingChannel } from '../types';
import { StreamCapabilities } from '../types/stream-capabilities.type';
export declare const validateStream: (stream: StreamingChannel, capabilities: StreamCapabilities) => {
    valid: boolean;
    invalidProperties: {
        key: string;
        value: any;
        validator: any;
    }[];
} | {
    valid: boolean;
    invalidProperties?: undefined;
};
