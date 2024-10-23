/// <reference types="node" />
import { DeviceStatus, Integrations, NotificationAlert, OnvifUser, StreamingChannel, StreamingStatus, NetworkInterface, MotionDetection } from '../types';
import { PutResponse, RawCapabilityResponse } from '../responses';
export declare const parseGeneric: (data: Buffer) => any;
export declare const parseCapabilities: (data: Buffer) => RawCapabilityResponse;
export declare const parseNetworkInterfaces: (data: Buffer) => NetworkInterface[];
export declare const parseNetworkInterface: (data: Buffer) => NetworkInterface;
export declare const parseMotionDetection: (data: Buffer) => MotionDetection;
export declare const parseIntegrations: (data: Buffer) => Integrations;
export declare const parseUsersList: (data: Buffer) => OnvifUser[];
export declare const parseStreamingStatus: (data: Buffer) => StreamingStatus;
export declare const parseStreamingChannel: (data: Buffer) => StreamingChannel;
export declare const parseStreamingChannels: (data: Buffer) => StreamingChannel[];
export declare const parsePutResponse: (data: Buffer) => PutResponse;
export declare const parseStatus: (data: Buffer) => DeviceStatus;
export declare const parseAlert: (data: Buffer) => NotificationAlert;
