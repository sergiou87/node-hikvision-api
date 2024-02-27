"use strict";
// noinspection JSUnusedGlobalSymbols
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikVision = void 0;
const node_events_1 = require("node:events");
const net = require("net");
const NetKeepAlive = require("net-keepalive");
const axios_digest_auth_1 = require("@mhoc/axios-digest-auth");
const lib_1 = require("./lib");
class HikVision extends node_events_1.EventEmitter {
    get connected() {
        return this._connected;
    }
    constructor(options) {
        super();
        this.triggerActive = false;
        this.usingAuthDigest = false;
        this.isAuthenticated = false;
        this.authHeaderValue = '';
        this.activeEvents = {};
        this.connectionCount = 0;
        this.disconnecting = false;
        this.options = (0, lib_1.parseOptions)(options);
        this.connect();
    }
    // MARK: General
    /**
     * Get device status
     */
    async getStatus() {
        const data = await this.performRequest(this.getSystemURL('status'));
        return (0, lib_1.parseStatus)(data);
    }
    /**
     * Check if in day mode
     * @param channel defaults to 101
     */
    isDayMode(channel = 101) {
        return this.performRequest(this.getRequestURL(['Image', 'channels', channel, 'ISPMode']));
    }
    // MARK: Streaming
    /**
     * Get streaming channels
     */
    async getStreamingChannels() {
        const data = await this.performRequest(this.getStreamingURL('channels'));
        return (0, lib_1.parseStreamingChannels)(data);
    }
    /**
     * Get streaming status
     */
    async getStreamingStatus() {
        const data = await this.performRequest(this.getStreamingURL('status'));
        return (0, lib_1.parseStreamingStatus)(data);
    }
    /**
     * Get the capabilities for a channel
     * @param channel
     */
    async getStreamingCapabilities(channel = 101) {
        const data = await this.performRequest(this.getStreamingURL(['channels', channel, 'capabilities']));
        return (0, lib_1.parseGeneric)(data);
    }
    /**
     * Get a specific channel
     * @param channel
     */
    async getStreamingChannel(channel = 101) {
        const data = await this.performRequest(this.getStreamingURL(['channels', channel]));
        return (0, lib_1.parseStreamingChannel)(data);
    }
    /**
     * Update video streaming properties
     * @param channel
     * @param streamingChannel
     */
    async updateStreamingChannel(channel = 101, streamingChannel) {
        const data = await this.performRequest(this.getStreamingURL(['channels', channel]), 'PUT', (0, lib_1.buildStreamOptions)(streamingChannel, channel));
        return (0, lib_1.validatePutResponse)((0, lib_1.parsePutResponse)(data));
    }
    // MARK: Integrations
    /**
     * Get integrations for services
     */
    async getIntegrations() {
        const data = await this.performRequest(this.getSystemURL(['Network', 'Integrate']));
        return (0, lib_1.parseIntegrations)(data);
    }
    /**
     * Update integrations
     * @param integrations
     */
    async updateIntegrations(integrations) {
        const xml = (0, lib_1.buildIntegrations)(integrations);
        const data = await this.performRequest(this.getSystemURL(['Network', 'Integrate']), 'PUT', xml);
        return (0, lib_1.validatePutResponse)((0, lib_1.parsePutResponse)(data));
    }
    // MARK: Onvif
    /**
     * Get current ONVIF users
     */
    async getOnvifUsers() {
        const data = await this.performRequest(this.getSecurityURL(['ONVIF', 'users'], { security: 0 }));
        return (0, lib_1.parseUsersList)(data);
    }
    /**
     * Delete an ONVIF user by ID
     * @param userID
     */
    async deleteOnvifUser(userID) {
        const data = await this.performRequest(this.getSecurityURL(['ONVIF', 'users', userID]), 'DELETE');
        return (0, lib_1.validatePutResponse)((0, lib_1.parsePutResponse)(data));
    }
    /**
     * Add an ONVIF user
     * @param username
     * @param password
     * @param id - Must be unique
     * @param userType - OnvifUserType
     */
    async addOnvifUser(username, password, id, userType = 'mediaUser') {
        const user = (0, lib_1.buildOnvifUser)(username, password, id, userType);
        const data = await this.performRequest(this.getSecurityURL(['ONVIF', 'users'], { security: 0 }), 'POST', user);
        return (0, lib_1.parseGeneric)(data);
    }
    close() {
        this.disconnecting = true;
        this.client.end();
        this.client.destroy();
    }
    // MARK: Private
    connect() {
        const options = this.options;
        if (this.authHeaderValue.length === 0) {
            const bString = Buffer.from(options.username + ':' + options.password).toString('base64');
            this.authHeaderValue = `Basic ${bString}`;
        }
        this.client = net.connect({ host: options.host, port: options.port }, () => {
            const path = ['ISAPI', 'Event', 'notification', 'alertStream'];
            const headerItems = [
                `GET ${(0, lib_1.buildPathURL)(path)} HTTP/1.1`,
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
        });
        this.client.on('data', (data) => {
            if (this.isAuthenticated)
                this.handleAlert((0, lib_1.parseAlert)(data));
            else
                this.handleAuthResponse(data);
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
    handleConnection() {
        if (this.isAuthenticated || this.usingAuthDigest) {
            this.debugLog('Connected to ' + this.options.host + ':' + this.options.port);
            this._connected = true;
            this.emit('connect');
        }
    }
    handleDisconnect() {
        this.debugLog('Connection closed!');
        this.emit('disconnected');
        this._connected = false;
    }
    handleError(err) {
        this.debugLog('Connection error:', err);
        this.emit('error', err);
        this._connected = false;
    }
    handleAuthResponse(data) {
        const rawResponse = data.toString().split('\n');
        const authHeader = rawResponse.find((line) => line.toLowerCase().includes('www-authenticate'));
        if (!authHeader || authHeader.length === 0)
            return;
        const path = ['ISAPI', 'Event', 'notification', 'alertStream'];
        this.authHeaderValue = (0, lib_1.buildDigestHeader)(authHeader, (0, lib_1.buildPathURL)(path), this.options.username, this.options.password);
        this.usingAuthDigest = true;
    }
    handleAlert(alert) {
        const eventIdentifier = alert.eventType + alert.channelID;
        // Count 0 seems to indicate everything is fine and nothing is wrong, used as a heartbeat
        // if triggerActive is true, lets step through the activeEvents
        // If activeEvents has something, lets end those events and clear activeEvents and reset triggerActive
        if (alert.activePostCount === 0) {
            if (this.triggerActive == true)
                this.clearActiveEvents();
            else
                this.debugLog('Heartbeat');
        }
        else if (typeof this.activeEvents[eventIdentifier] == 'undefined' ||
            this.activeEvents[eventIdentifier] == null) {
            this.activeEvents[eventIdentifier] = {
                eventType: alert.eventType,
                channelID: alert.channelID,
                lastTimestamp: Date.now(),
            };
            this.emit('alarm', alert.eventType, alert.eventState, alert.channelID);
            this.triggerActive = true;
        }
        else {
            this.debugLog('    Skipped Event: ' +
                alert.eventType +
                ' ' +
                alert.eventState +
                ' ' +
                alert.channelID +
                ' ' +
                alert.activePostCount);
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
                    this.debugLog('Ending Event: ' +
                        eventIdentifier +
                        ' - ' +
                        details.eventType +
                        ' - ' +
                        (Date.now() - details.lastTimestamp) / 1000);
                    this.emit('alarm', details.eventType, 'Stop', details.channelID);
                    delete this.activeEvents[eventIdentifier];
                }
            });
        }
    }
    clearActiveEvents() {
        Object.keys(this.activeEvents).forEach((id) => {
            const details = this.activeEvents[id];
            this.debugLog(`Ending Event: ${id} - ${details.eventType} - ${(Date.now() - details.lastTimestamp) / 1000}`);
            this.emit('alarm', details.eventType, 'Stop', details.channelID);
        });
        this.activeEvents = {};
        this.triggerActive = false;
    }
    getStreamingURL(parts = [], query = null) {
        return this.getRequestURL(['Streaming', ...(Array.isArray(parts) ? parts : [parts])], query);
    }
    getSystemURL(parts = [], query = null) {
        return this.getRequestURL(['System', ...(Array.isArray(parts) ? parts : [parts])], query);
    }
    getSecurityURL(parts = [], query = null) {
        return this.getRequestURL(['Security', ...(Array.isArray(parts) ? parts : [parts])], query);
    }
    getRequestURL(parts = [], query = null) {
        let url = `${this.options.protocol}://${this.options.host}:${this.options.port}/ISAPI${(0, lib_1.buildPathURL)(parts)}`;
        if (query !== null) {
            const queryParams = Object.keys(query)
                .map((k) => `${k}=${JSON.stringify(query[k])}`)
                .join('&');
            url = `${url}?${queryParams}`;
        }
        return url;
    }
    async performRequest(url, method = 'GET', data) {
        const digestAuth = new axios_digest_auth_1.default({
            username: this.options.username,
            password: this.options.password,
        });
        const result = await digestAuth.request({
            method,
            url,
            data,
        });
        if (!data)
            this.debugLog(`Sending ${method} request to URL`, url);
        else
            this.debugLog(`Sending ${method} request to URL`, url, 'with data', data);
        return result.data;
    }
    debugLog(message, ...optionalParams) {
        if (this.options.debug)
            console.log(message, ...optionalParams);
    }
}
exports.HikVision = HikVision;
