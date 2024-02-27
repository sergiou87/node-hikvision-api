// noinspection JSUnusedGlobalSymbols

import { EventEmitter } from 'node:events';
import * as net from 'net';
import * as NetKeepAlive from 'net-keepalive';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';

import {
  parseAlert,
  parseGeneric,
  parseIntegrations,
  parsePutResponse,
  parseStatus,
  parseStreamingChannel,
  parseStreamingChannels,
  parseStreamingStatus,
  parseUsersList,
  buildIntegrations,
  buildOnvifUser,
  buildStreamOptions,
  buildDigestHeader,
  parseOptions,
  validatePutResponse,
  buildPathURL,
  parseCapabilities,
  parseNetworkInterfaces,
  parseNetworkInterface,
  buildNetworkInterface,
} from './lib';
import { Method } from 'axios';
import {
  CameraEvent,
  DeviceStatus,
  HikVisionOptions,
  HikVisionPartialOptions,
  Integrations,
  NotificationAlert,
  OnvifUser,
  OnvifUserType,
  StreamingChannel,
  StreamingStatus,
} from './types';
import { NetworkInterface } from './types/network-interface.type';
import { RawCapabilityResponse } from './responses';

export class HikVision extends EventEmitter {
  private triggerActive = false;
  private usingAuthDigest = false;
  private isAuthenticated = false;
  private authHeaderValue: string = '';
  private activeEvents: { [key: string]: CameraEvent } = {};
  private client: net.Socket;
  private connectionCount = 0;
  private disconnecting = false;
  private readonly options: HikVisionOptions;
  private _connected: boolean;

  get connected() {
    return this._connected;
  }

  constructor(options: HikVisionPartialOptions) {
    super();

    this.options = parseOptions(options);

    this.connect();
  }

  // MARK: General

  /**
   * Get device status
   */
  async getStatus(): Promise<DeviceStatus> {
    const data = await this.performRequest(this.getSystemURL('status'));
    return parseStatus(data);
  }

  /**
   * Check if in day mode
   * @param channel defaults to 101
   */
  async isDayMode(channel = 101): Promise<any> {
    const data = await this.performRequest(
      this.getRequestURL(['Image', 'channels', channel, 'ISPMode']),
    );

    return parseGeneric(data);
  }

  // MARK: Streaming

  /**
   * Get streaming channels
   */
  async getStreamingChannels(): Promise<StreamingChannel[]> {
    const data = await this.performRequest(this.getStreamingURL('channels'));
    return parseStreamingChannels(data);
  }

  /**
   * Get streaming status
   */
  async getStreamingStatus(): Promise<StreamingStatus> {
    const data = await this.performRequest(this.getStreamingURL('status'));
    return parseStreamingStatus(data);
  }

  /**
   * Get the capabilities for a channel
   * @param channel
   */
  async getStreamingCapabilities(
    channel = 101,
  ): Promise<RawCapabilityResponse> {
    const data = await this.performRequest(
      this.getStreamingURL(['channels', channel, 'capabilities']),
    );
    return parseCapabilities(data);
  }

  /**
   * Get a specific channel
   * @param channel
   */
  async getStreamingChannel(channel = 101): Promise<StreamingChannel> {
    const data = await this.performRequest(
      this.getStreamingURL(['channels', channel]),
    );
    return parseStreamingChannel(data);
  }

  /**
   * Update video streaming properties
   * @param channel
   * @param streamingChannel
   */
  async updateStreamingChannel(
    channel = 101,
    streamingChannel: StreamingChannel,
  ): Promise<{ success: boolean }> {
    const data = await this.performRequest(
      this.getStreamingURL(['channels', channel]),
      'PUT',
      buildStreamOptions(streamingChannel, channel),
    );

    return validatePutResponse(parsePutResponse(data));
  }

  // MARK: Integrations

  /**
   * Get integrations for services
   */
  async getIntegrations(): Promise<Integrations> {
    const data = await this.performRequest(
      this.getSystemURL(['Network', 'Integrate']),
    );

    return parseIntegrations(data);
  }

  /**
   * Update integrations
   * @param integrations
   */
  async updateIntegrations(
    integrations: Integrations,
  ): Promise<{ success: boolean }> {
    const xml = buildIntegrations(integrations);
    const data = await this.performRequest(
      this.getSystemURL(['Network', 'Integrate']),
      'PUT',
      xml,
    );

    return validatePutResponse(parsePutResponse(data));
  }

  // MARK: Onvif

  /**
   * Get current ONVIF users
   */
  async getOnvifUsers(): Promise<OnvifUser[]> {
    const data = await this.performRequest(
      this.getSecurityURL(['ONVIF', 'users'], { security: 0 }),
    );

    return parseUsersList(data);
  }

  /**
   * Delete an ONVIF user by ID
   * @param userID
   */
  async deleteOnvifUser(userID: number): Promise<{ success: boolean }> {
    const data = await this.performRequest(
      this.getSecurityURL(['ONVIF', 'users', userID]),
      'DELETE',
    );

    return validatePutResponse(parsePutResponse(data));
  }

  /**
   * Add an ONVIF user
   * @param username
   * @param password
   * @param id - Must be unique
   * @param userType - OnvifUserType
   */
  async addOnvifUser(
    username: string,
    password: string,
    id: number,
    userType: OnvifUserType = 'mediaUser',
  ) {
    const user = buildOnvifUser(username, password, id, userType);
    const data = await this.performRequest(
      this.getSecurityURL(['ONVIF', 'users'], { security: 0 }),
      'POST',
      user,
    );

    return parseGeneric(data);
  }

  // MARK: Network

  /**
   * Get network interfaces
   */
  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    const data = await this.performRequest(
      this.getSystemURL(['Network', 'interfaces']),
    );
    return parseNetworkInterfaces(data);
  }

  /**
   * Get a single network interface
   * @param id
   */
  async getNetworkInterface(id: number): Promise<NetworkInterface> {
    const data = await this.performRequest(
      this.getSystemURL(['Network', 'interfaces', id]),
    );

    return parseNetworkInterface(data);
  }

  /**
   * Update network interface
   * @param id
   * @param networkInterface
   */
  async updateNetworkInterface(
    id: number,
    networkInterface: NetworkInterface,
  ): Promise<{ success: boolean }> {
    const data = await this.performRequest(
      this.getSystemURL(['Network', 'interfaces', id]),
      'PUT',
      buildNetworkInterface(networkInterface),
    );

    return validatePutResponse(parsePutResponse(data));
  }

  close() {
    this.disconnecting = true;
    this.client.end();
    this.client.destroy();
  }

  // MARK: Private

  private connect() {
    const options = this.options;

    if (this.authHeaderValue.length === 0) {
      const bString = Buffer.from(
        options.username + ':' + options.password,
      ).toString('base64');
      this.authHeaderValue = `Basic ${bString}`;
    }

    this.client = net.connect(
      { host: options.host, port: options.port },
      () => {
        const path = ['ISAPI', 'Event', 'notification', 'alertStream'];

        const headerItems = [
          `GET ${buildPathURL(path)} HTTP/1.1`,
          `Host: ${options.host}:${options.port}`,
          `Authorization: ${this.authHeaderValue}`,
          'Accept: multipart/x-mixed-replace',
        ];

        const header = `${headerItems.join('\r\n')}\r\n\r\n`;

        this.connectionCount += 1;
        this.client.write(header);
        this.client.setKeepAlive(true, 1000);
        NetKeepAlive.setKeepAliveInterval(this.client, 5000);
        NetKeepAlive.setKeepAliveProbes(this.client, 12);
        this.handleConnection();
      },
    );

    this.client.on('data', (data) => {
      if (this.isAuthenticated) this.handleAlert(parseAlert(data));
      else this.handleAuthResponse(data);
    });

    this.client.on('close', () => {
      // Try to reconnect after specified time frame (default 30 seconds)
      if (this.connectionCount < 2) {
        this.connect();
        return;
      }

      if (!this.disconnecting)
        setTimeout(() => {
          this.connect();
        }, options.reconnectAfter);

      this.handleDisconnect();
    });

    this.client.on('error', (err) => {
      this.handleError(err);
    });
  }

  private handleConnection() {
    if (this.isAuthenticated || this.usingAuthDigest) {
      this.debugLog(
        'Connected to ' + this.options.host + ':' + this.options.port,
      );
      this._connected = true;
      this.emit('connect');
    }
  }

  private handleDisconnect() {
    this.debugLog('Connection closed!');
    this.emit('disconnected');
    this._connected = false;
  }

  private handleError(err: Error) {
    this.debugLog('Connection error:', err);
    this.emit('error', err);
    this._connected = false;
  }

  private handleAuthResponse(data: Buffer) {
    const rawResponse = data.toString().split('\n');

    const authHeader: string = rawResponse.find((line) =>
      line.toLowerCase().includes('www-authenticate'),
    );

    if (!authHeader || authHeader.length === 0) return;

    const path = ['ISAPI', 'Event', 'notification', 'alertStream'];
    this.authHeaderValue = buildDigestHeader(
      authHeader,
      buildPathURL(path),
      this.options.username,
      this.options.password,
    );

    this.usingAuthDigest = true;
  }

  private handleAlert(alert: NotificationAlert) {
    const eventIdentifier = alert.eventType + alert.channelID;

    // Count 0 seems to indicate everything is fine and nothing is wrong, used as a heartbeat
    // if triggerActive is true, lets step through the activeEvents
    // If activeEvents has something, lets end those events and clear activeEvents and reset triggerActive
    if (alert.activePostCount === 0) {
      if (this.triggerActive == true) this.clearActiveEvents();
      else this.debugLog('Heartbeat');
    } else if (
      typeof this.activeEvents[eventIdentifier] == 'undefined' ||
      this.activeEvents[eventIdentifier] == null
    ) {
      this.activeEvents[eventIdentifier] = {
        eventType: alert.eventType,
        channelID: alert.channelID,
        lastTimestamp: Date.now(),
      };
      this.emit('alarm', alert.eventType, alert.eventState, alert.channelID);
      this.triggerActive = true;
    } else {
      this.debugLog(
        '    Skipped Event: ' +
          alert.eventType +
          ' ' +
          alert.eventState +
          ' ' +
          alert.channelID +
          ' ' +
          alert.activePostCount,
      );

      // Update lastTimestamp
      this.activeEvents[eventIdentifier] = {
        eventType: alert.eventType,
        channelID: alert.channelID,
        lastTimestamp: Date.now(),
      };

      // step through activeEvents
      // if we haven't seen it in more than 2 seconds, lets end it and remove from activeEvents
      Object.keys(this.activeEvents).forEach((eventIdentifier) => {
        const details = this.activeEvents[eventIdentifier];

        if ((Date.now() - details.lastTimestamp) / 1000 > 2) {
          this.debugLog(
            'Ending Event: ' +
              eventIdentifier +
              ' - ' +
              details.eventType +
              ' - ' +
              (Date.now() - details.lastTimestamp) / 1000,
          );

          this.emit('alarm', details.eventType, 'Stop', details.channelID);
          delete this.activeEvents[eventIdentifier];
        }
      });
    }
  }

  private clearActiveEvents() {
    Object.keys(this.activeEvents).forEach((id) => {
      const details = this.activeEvents[id];
      this.debugLog(
        `Ending Event: ${id} - ${details.eventType} - ${(Date.now() - details.lastTimestamp) / 1000}`,
      );

      this.emit('alarm', details.eventType, 'Stop', details.channelID);
    });

    this.activeEvents = {};
    this.triggerActive = false;
  }

  private getStreamingURL(
    parts: (string | number)[] | string = [],
    query: { [key: string | number]: any } | null = null,
  ) {
    return this.getRequestURL(
      ['Streaming', ...(Array.isArray(parts) ? parts : [parts])],
      query,
    );
  }

  private getSystemURL(
    parts: (string | number)[] | string = [],
    query: { [key: string | number]: any } | null = null,
  ) {
    return this.getRequestURL(
      ['System', ...(Array.isArray(parts) ? parts : [parts])],
      query,
    );
  }

  private getSecurityURL(
    parts: (string | number)[] | string = [],
    query: { [key: string | number]: any } | null = null,
  ) {
    return this.getRequestURL(
      ['Security', ...(Array.isArray(parts) ? parts : [parts])],
      query,
    );
  }

  private getRequestURL(
    parts: (string | number)[] = [],
    query: { [key: string | number]: any } | null = null,
  ) {
    let url = `${this.options.protocol}://${this.options.host}:${this.options.port}/ISAPI${buildPathURL(parts)}`;

    if (query !== null) {
      const queryParams = Object.keys(query)
        .map((k) => `${k}=${JSON.stringify(query[k])}`)
        .join('&');

      url = `${url}?${queryParams}`;
    }

    return url;
  }

  private async performRequest(
    url: string,
    method: Method = 'GET',
    data?: any,
  ) {
    const digestAuth = new AxiosDigestAuth({
      username: this.options.username,
      password: this.options.password,
    });

    const result = await digestAuth.request({
      method,
      url,
      data,
    });

    if (!data) this.debugLog(`Sending ${method} request to URL`, url);
    else
      this.debugLog(`Sending ${method} request to URL`, url, 'with data', data);

    return result.data as any;
  }

  private debugLog(message?: any, ...optionalParams: any[]) {
    if (this.options.debug) console.log(message, ...optionalParams);
  }
}
