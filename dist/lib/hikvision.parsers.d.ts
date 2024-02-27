/// <reference types="node" />
import { DeviceStatus, Integrations, NotificationAlert, OnvifUser, StreamingChannel, StreamingStatus } from '../types';
import { PutResponse } from '../responses';
export declare const parseGeneric: (data: Buffer) => any;
export declare const parseIntegrations: (data: Buffer) => Integrations;
export declare const parseUsersList: (data: Buffer) => OnvifUser[];
export declare const parseStreamingStatus: (data: Buffer) => StreamingStatus;
export declare const parseStreamingChannel: (data: Buffer) => StreamingChannel;
export declare const parseStreamingChannels: (data: Buffer) => StreamingChannel[];
export declare const parsePutResponse: (data: Buffer) => PutResponse;
export declare const parseStatus: (data: Buffer) => DeviceStatus;
export declare const parseAlert: (data: Buffer) => NotificationAlert;
