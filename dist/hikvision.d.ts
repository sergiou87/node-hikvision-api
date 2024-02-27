/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { DeviceStatus, HikVisionPartialOptions, Integrations, OnvifUserType, StreamingChannel, StreamingStatus } from './types';
export declare class HikVision extends EventEmitter {
    private triggerActive;
    private usingAuthDigest;
    private isAuthenticated;
    private authHeaderValue;
    private activeEvents;
    private client;
    private connectionCount;
    private disconnecting;
    private readonly options;
    private _connected;
    get connected(): boolean;
    constructor(options: HikVisionPartialOptions);
    /**
     * Get device status
     */
    getStatus(): Promise<DeviceStatus>;
    /**
     * Check if in day mode
     * @param channel defaults to 101
     */
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
        response: import("./responses").PutResponse;
    }>;
    /**
     * Get current ONVIF users
     */
    getOnvifUsers(): Promise<import("./types").OnvifUser[]>;
    /**
     * Delete an ONVIF user by ID
     * @param userID
     */
    deleteOnvifUser(userID: number): Promise<{
        success: boolean;
        response: import("./responses").PutResponse;
    }>;
    /**
     * Add an ONVIF user
     * @param username
     * @param password
     * @param id - Must be unique
     * @param userType - OnvifUserType
     */
    addOnvifUser(username: string, password: string, id: number, userType?: OnvifUserType): Promise<any>;
    close(): void;
    private connect;
    private handleConnection;
    private handleDisconnect;
    private handleError;
    private handleAuthResponse;
    private handleAlert;
    private clearActiveEvents;
    private getStreamingURL;
    private getSystemURL;
    private getSecurityURL;
    private getRequestURL;
    private performRequest;
    private debugLog;
}
