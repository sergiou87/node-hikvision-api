/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { DeviceStatus, HikVisionPartialOptions, Integrations, OnvifUserType, StreamingChannel, StreamingStatus } from './types';
export declare class HikVision extends EventEmitter {
    private triggerActive;
    private usingAuthDigest;
    private isAuthenticated;
    private authHeader;
    private activeEvents;
    private client;
    private connectionCount;
    private readonly options;
    private _connected;
    get connected(): boolean;
    constructor(options: HikVisionPartialOptions);
    /**
     * Get device status
     */
    getStatus(): Promise<DeviceStatus>;
    isDayMode(channel?: number): Promise<any>;
    /**
     * Get streaming channels
     */
    getStreamingChannels(): Promise<StreamingChannel[]>;
    /**
     * Get streaming status
     */
    getStreamingStatus(): Promise<StreamingStatus>;
    /**
     * Get the capabilities for a channel
     * @param channel
     */
    getStreamingCapabilities(channel?: number): Promise<any>;
    /**
     * Get a specific channel
     * @param channel
     */
    getStreamingChannel(channel?: number): Promise<StreamingChannel>;
    /**
     * Update video streaming properties
     * @param channel
     * @param streamingChannel
     */
    updateStreamingChannel(channel: number, streamingChannel: StreamingChannel): Promise<{
        success: boolean;
        /**
         * Get streaming status
         */
        response: import("./responses").PutResponse;
    }>;
    /**
     * Get integrations for services
     */
    getIntegrations(): Promise<Integrations>;
    /**
     * Update integrations
     * @param integrations
     */
    updateIntegrations(integrations: Integrations): Promise<{
        success: boolean;
        /**
         * Get streaming status
         */
        response: import("./responses").PutResponse;
    }>;
    getOnvifUsers(): Promise<import("./types").OnvifUser[]>;
    deleteOnvifUser(userID: number): Promise<{
        success: boolean;
        /**
         * Get streaming status
         */
        response: import("./responses").PutResponse;
    }>;
    addOnvifUser(username: string, password: string, id: number, userType?: OnvifUserType): Promise<any>;
    private performRequest;
    private connect;
    private handleConnection;
    private handleDisconnect;
    private handleError;
    private handleAuthResponse;
    private handleAlert;
    private clearActiveEvents;
    private debugLog;
}
