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
} from './lib';
import { Method } from 'axios';
import {
  CameraEvent,
  DeviceStatus,
  HikVisionOptions,
  HikVisionPartialOptions,
  Integrations,
  NotificationAlert,
  OnvifUserType,
  StreamingChannel,
  StreamingStatus,
} from './types';

export class HikVision extends EventEmitter {
  private triggerActive = false;
  private usingAuthDigest = false;
  private isAuthenticated = false;
  private authHeader: string = '';
  private activeEvents: { [key: string]: CameraEvent } = {};
  private client: net.Socket;
  private connectionCount = 0;
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
    const url = `http://${this.options.host}/ISAPI/System/status`;

    const data = await this.performRequest(url);
    return parseStatus(data);
  }

  isDayMode(channel = 1) {
    const url = `http://${this.options.host}/ISAPI/Image/channels/${channel}/ISPMode`;

    return this.performRequest(url);
  }

  // MARK: Streaming

  /**
   * Get streaming channels
   */
  async getStreamingChannels(): Promise<StreamingChannel[]> {
    const url = `http://${this.options.host}/ISAPI/Streaming/channels`;
    const data = await this.performRequest(url);
    return parseStreamingChannels(data);
  }

  /**
   * Get streaming status
   */
  async getStreamingStatus(): Promise<StreamingStatus> {
    const url = `http://${this.options.host}/ISAPI/Streaming/status`;
    const data = await this.performRequest(url);
    return parseStreamingStatus(data);
  }

  /**
   * Get the capabilities for a channel
   * @param channel
   */
  async getStreamingCapabilities(channel = 1) {
    const url = `http://${this.options.host}/ISAPI/Streaming/channels/${channel}/capabilities`;
    const data = await this.performRequest(url);
    return parseGeneric(data);
  }

  /**
   * Get a specific channel
   * @param channel
   */
  async getStreamingChannel(channel = 1) {
    const url = `http://${this.options.host}/ISAPI/Streaming/channels/${channel}`;
    const data = await this.performRequest(url);
    return parseStreamingChannel(data);
  }

  /**
   * Update video streaming properties
   * @param channel
   * @param streamingChannel
   */
  async updateStreamingChannel(
    channel = 1,
    streamingChannel: StreamingChannel,
  ) {
    const url = `http://${this.options.host}/ISAPI/Streaming/channels/${channel}`;
    const data = await this.performRequest(
      url,
      'PUT',
      buildStreamOptions(streamingChannel),
    );

    return validatePutResponse(parsePutResponse(data));
  }

  // MARK: Integrations

  /**
   * Get integrations for services
   */
  async getIntegrations() {
    const url = `http://${this.options.host}/ISAPI/System/Network/Integrate`;
    const data = await this.performRequest(url);
    return parseIntegrations(data);
  }

  /**
   * Update integrations
   * @param integrations
   */
  async updateIntegrations(integrations: Integrations) {
    const url = `http://${this.options.host}/ISAPI/System/Network/Integrate`;
    const xml = buildIntegrations(integrations);
    const data = await this.performRequest(url, 'PUT', xml);
    return validatePutResponse(parsePutResponse(data));
  }

  // MARK: Onvif

  async getOnvifUsers() {
    const url = `http://${this.options.host}/ISAPI/Security/ONVIF/users?security=0`;

    const data = await this.performRequest(url);
    return parseUsersList(data);
  }

  async deleteOnvifUser(userID: number) {
    const url = `http://${this.options.host}/ISAPI/Security/ONVIF/users/${userID}`;
    const data = await this.performRequest(url, 'DELETE');
    return validatePutResponse(parsePutResponse(data));
  }

  async addOnvifUser(
    username: string,
    password: string,
    id: number,
    userType: OnvifUserType = 'mediaUser',
  ) {
    const url = `http://${this.options.host}/ISAPI/Security/ONVIF/users?security=0`;
    const user = buildOnvifUser(username, password, id, userType);
    const data = await this.performRequest(url, 'POST', user);

    return parseGeneric(data);
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

    return result.data as any;
  }

  private connect() {
    const options = this.options;

    if (this.authHeader.length === 0) {
      const bString = Buffer.from(
        options.username + ':' + options.password,
      ).toString('base64');
      this.authHeader = `Authorization: Basic ${bString}`;
    }

    this.client = net.connect(
      { host: options.host, port: options.port },
      () => {
        const header =
          'GET /ISAPI/Event/notification/alertStream HTTP/1.1\r\n' +
          'Host: ' +
          options.host +
          ':' +
          options.port +
          '\r\n' +
          this.authHeader +
          '\r\n' +
          'Accept: multipart/x-mixed-replace\r\n\r\n';

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
      if (this.connectionCount <= 2) {
        this.connect();
        return;
      }

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

    const authHeaderContent = buildDigestHeader(
      authHeader,
      '/ISAPI/Event/notification/alertStream',
      this.options.username,
      this.options.password,
    );

    this.authHeader = `Authorization: ${authHeaderContent}`;

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

  private debugLog(message?: any, ...optionalParams: any[]) {
    if (this.options.debug) console.log(message, ...optionalParams);
  }
}
