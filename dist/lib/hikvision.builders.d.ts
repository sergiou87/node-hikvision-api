import { Integrations, OnvifUserType, StreamingChannel } from '../types';
/**
 * Build integrations object in raw XML
 * @param integrations
 */
export declare const buildIntegrations: (integrations: Integrations) => any;
/**
 * Build video stream options
 * @param channel
 * @param channelID
 */
export declare const buildStreamOptions: (channel: StreamingChannel, channelID: number) => string;
/**
 * @param username
 * @param password
 * @param id
 * @param userType
 */
export declare const buildOnvifUser: (username: string, password: string, id: number, userType: OnvifUserType) => any;
