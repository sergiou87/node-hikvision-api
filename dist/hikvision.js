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
        this.authHeader = '';
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
        const url = `http://${this.options.host}/ISAPI/System/status`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseStatus)(data);
    }
    isDayMode(channel = 101) {
        const url = `http://${this.options.host}/ISAPI/Image/channels/${channel}/ISPMode`;
        return this.performRequest(url);
    }
    // MARK: Streaming
    /**
     * Get streaming channels
     */
    async getStreamingChannels() {
        const url = `http://${this.options.host}/ISAPI/Streaming/channels`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseStreamingChannels)(data);
    }
    /**
     * Get streaming status
     */
    async getStreamingStatus() {
        const url = `http://${this.options.host}/ISAPI/Streaming/status`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseStreamingStatus)(data);
    }
    /**
     * Get the capabilities for a channel
     * @param channel
     */
    async getStreamingCapabilities(channel = 101) {
        const url = `http://${this.options.host}/ISAPI/Streaming/channels/${channel}/capabilities`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseGeneric)(data);
    }
    /**
     * Get a specific channel
     * @param channel
     */
    async getStreamingChannel(channel = 101) {
        const url = `http://${this.options.host}/ISAPI/Streaming/channels/${channel}`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseStreamingChannel)(data);
    }
    /**
     * Update video streaming properties
     * @param channel
     * @param streamingChannel
     */
    async updateStreamingChannel(channel = 101, streamingChannel) {
        const url = `http://${this.options.host}/ISAPI/Streaming/channels/${channel}`;
        const data = await this.performRequest(url, 'PUT', (0, lib_1.buildStreamOptions)(streamingChannel, channel));
        return (0, lib_1.validatePutResponse)((0, lib_1.parsePutResponse)(data));
    }
    // MARK: Integrations
    /**
     * Get integrations for services
     */
    async getIntegrations() {
        const url = `http://${this.options.host}/ISAPI/System/Network/Integrate`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseIntegrations)(data);
    }
    /**
     * Update integrations
     * @param integrations
     */
    async updateIntegrations(integrations) {
        const url = `http://${this.options.host}/ISAPI/System/Network/Integrate`;
        const xml = (0, lib_1.buildIntegrations)(integrations);
        const data = await this.performRequest(url, 'PUT', xml);
        return (0, lib_1.validatePutResponse)((0, lib_1.parsePutResponse)(data));
    }
    // MARK: Onvif
    async getOnvifUsers() {
        const url = `http://${this.options.host}/ISAPI/Security/ONVIF/users?security=0`;
        const data = await this.performRequest(url);
        return (0, lib_1.parseUsersList)(data);
    }
    async deleteOnvifUser(userID) {
        const url = `http://${this.options.host}/ISAPI/Security/ONVIF/users/${userID}`;
        const data = await this.performRequest(url, 'DELETE');
        return (0, lib_1.validatePutResponse)((0, lib_1.parsePutResponse)(data));
    }
    async addOnvifUser(username, password, id, userType = 'mediaUser') {
        const url = `http://${this.options.host}/ISAPI/Security/ONVIF/users?security=0`;
        const user = (0, lib_1.buildOnvifUser)(username, password, id, userType);
        const data = await this.performRequest(url, 'POST', user);
        return (0, lib_1.parseGeneric)(data);
    }
    close() {
        this.disconnecting = true;
        this.client.end();
        this.client.destroy();
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
        return result.data;
    }
    connect() {
        const options = this.options;
        if (this.authHeader.length === 0) {
            const bString = Buffer.from(options.username + ':' + options.password).toString('base64');
            this.authHeader = `Authorization: Basic ${bString}`;
        }
        this.client = net.connect({ host: options.host, port: options.port }, () => {
            const header = 'GET /ISAPI/Event/notification/alertStream HTTP/1.1\r\n' +
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
        const authHeaderContent = (0, lib_1.buildDigestHeader)(authHeader, '/ISAPI/Event/notification/alertStream', this.options.username, this.options.password);
        this.authHeader = `Authorization: ${authHeaderContent}`;
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
    debugLog(message, ...optionalParams) {
        if (this.options.debug)
            console.log(message, ...optionalParams);
    }
}
exports.HikVision = HikVision;
