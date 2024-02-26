"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikVision = void 0;
const node_events_1 = require("node:events");
const hikvision_options_1 = require("./hikvision.options");
const net = require("net");
const net_keepalive_1 = require("net-keepalive");
const xml2js_1 = require("xml2js");
class HikVision extends node_events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.parser = new xml2js_1.Parser();
        this.triggerActive = false;
        this.activeEvents = {};
    }
    connect(_options) {
        const options = this.parseOptions(_options);
        const bString = Buffer.from(options.username + ':' + options.password).toString('base64');
        const authHeader = `Authorization: Basic ${bString}`;
        const client = net.connect({ host: options.host, port: options.port }, () => {
            const header = 'GET /ISAPI/Event/notification/alertStream HTTP/1.1\r\n' +
                'Host: ' +
                options.host +
                ':' +
                options.port +
                '\r\n' +
                authHeader +
                '\r\n' +
                'Accept: multipart/x-mixed-replace\r\n\r\n';
            client.write(header);
            client.setKeepAlive(true, 1000);
            net_keepalive_1.default.setKeepAliveInterval(client, 5000);
            net_keepalive_1.default.setKeepAliveProbes(client, 12);
            this.handleConnection(options);
        });
        client.on('data', (data) => {
            this.handleData(options, data);
        });
        client.on('close', () => {
            // Try to reconnect after 30s
            setTimeout(() => {
                this.connect(options);
            }, 30000);
            this.handleEnd(options);
        });
        client.on('error', (err) => {
            this.handleError(options, err);
        });
    }
    handleConnection(options) {
        if (options.log)
            console.log('Connected to ' + options.host + ':' + options.port);
        this.emit('connect');
    }
    handleEnd(options) {
        if (options.log)
            console.log('Connection closed!');
        this.emit('end');
    }
    handleError(options, err) {
        if (options.log)
            console.log('Connection error: ' + err);
        this.emit('error', err);
    }
    handleData(options, data) {
        this.parser.parseString(data, (err, result) => {
            if (result) {
                let code = result['EventNotificationAlert']['eventType'][0];
                let action = result['EventNotificationAlert']['eventState'][0];
                const index = parseInt(result['EventNotificationAlert']['channelID'][0]);
                const count = parseInt(result['EventNotificationAlert']['activePostCount'][0]);
                // give codes returned by camera prettier and standardized description
                if (code === 'IO')
                    code = 'AlarmLocal';
                if (code === 'VMD')
                    code = 'VideoMotion';
                if (code === 'linedetection')
                    code = 'LineDetection';
                if (code === 'videoloss')
                    code = 'VideoLoss';
                if (code === 'shelteralarm')
                    code = 'VideoBlind';
                if (action === 'active')
                    action = 'Start';
                if (action === 'inactive')
                    action = 'Stop';
                // create and event identifier for each recieved event
                // This allows multiple detection types with multiple indexes for DVR or multihead devices
                const eventIdentifier = code + index;
                // Count 0 seems to indicate everything is fine and nothing is wrong, used as a heartbeat
                // if triggerActive is true, lets step through the activeEvents
                // If activeEvents has something, lets end those events and clear activeEvents and reset triggerActive
                if (count == 0) {
                    if (this.triggerActive == true) {
                        for (const i in this.activeEvents) {
                            if (this.activeEvents.hasOwnProperty(i)) {
                                const details = this.activeEvents[i];
                                if (options.log)
                                    console.log('Ending Event: ' +
                                        i +
                                        ' - ' +
                                        details.code +
                                        ' - ' +
                                        (Date.now() - details.lastTimestamp) / 1000);
                                this.emit('alarm', details.code, 'Stop', details.index);
                            }
                        }
                        this.activeEvents = {};
                        this.triggerActive = false;
                    }
                    else {
                        // should be the most common result
                        // Nothing interesting happening and we haven't seen any events
                        if (options.log)
                            this.emit('alarm', code, action, index);
                    }
                }
                // if the first instance of an eventIdentifier, lets emit it,
                // add to activeEvents and set triggerActive
                else if (typeof this.activeEvents[eventIdentifier] == 'undefined' ||
                    this.activeEvents[eventIdentifier] == null) {
                    this.activeEvents[eventIdentifier] = {
                        code,
                        index,
                        lastTimestamp: Date.now(),
                    };
                    this.emit('alarm', code, action, index);
                    this.triggerActive = true;
                    // known active events
                }
                else {
                    if (options.log)
                        console.log('    Skipped Event: ' +
                            code +
                            ' ' +
                            action +
                            ' ' +
                            index +
                            ' ' +
                            count);
                    // Update lastTimestamp
                    this.activeEvents[eventIdentifier] = {
                        code,
                        index,
                        lastTimestamp: Date.now(),
                    };
                    // step through activeEvents
                    // if we haven't seen it in more than 2 seconds, lets end it and remove from activeEvents
                    Object.keys(this.activeEvents).forEach((eventIdentifier) => {
                        const details = this.activeEvents[eventIdentifier];
                        if ((Date.now() - details.lastTimestamp) / 1000 > 2) {
                            if (options.log)
                                console.log('    Ending Event: ' +
                                    eventIdentifier +
                                    ' - ' +
                                    details.code +
                                    ' - ' +
                                    (Date.now() - details.lastTimestamp) / 1000);
                            this.emit('alarm', details.code, 'Stop', details.index);
                            delete this.activeEvents[eventIdentifier];
                        }
                    });
                }
            }
        });
    }
    parseOptions(options) {
        const defaultOptions = { ...hikvision_options_1.HikVisionDefaultOptions };
        return {
            username: options.username,
            password: options.password,
            log: options.log || defaultOptions.log || false,
            host: options.host,
            port: parseInt(`${options.port || defaultOptions.port}`),
        };
    }
}
exports.HikVision = HikVision;
