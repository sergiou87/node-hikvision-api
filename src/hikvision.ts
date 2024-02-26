import { EventEmitter } from 'node:events';
import * as net from 'net';
import * as NetKeepAlive from 'net-keepalive';
import { Parser } from 'xml2js';
import { buildDigestHeader, parseOptions } from './helpers';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import {
  HikVisionDeviceStatus,
  HikVisionEvent,
  HikVisionOptions,
  HikVisionPartialOptions,
} from './hikvision.types';

export class HikVision extends EventEmitter {
  private parser: Parser = new Parser();
  private triggerActive = false;
  private usingAuthDigest = false;
  private isAuthenticated = false;
  private authHeader: string = '';
  private activeEvents: { [key: string]: HikVisionEvent } = {};
  private options: HikVisionOptions;
  private client: net.Socket;
  private connectionCount = 0;

  constructor(options: HikVisionPartialOptions) {
    super();

    this.options = parseOptions(options);

    this.connect();
  }

  getStatus() {
    const url = `http://${this.options.host}/ISAPI/System/status`;

    return this.performGetRequest(url).then((result) =>
      this.parseStatus(result),
    );
  }

  isDayMode(channel = 1) {
    const url = `http://${this.options.host}/ISAPI/Image/channels/${channel}/ISPMode`;

    return this.performGetRequest(url);
  }

  checkStreamingStatus() {
    const url = `http://${this.options.host}/ISAPI/Streaming/channels`;
    return this.performGetRequest(url);
  }

  private async performGetRequest(url: string) {
    const digestAuth = new AxiosDigestAuth({
      username: this.options.username,
      password: this.options.password,
    });

    const result = await digestAuth.request({
      method: 'GET',
      url,
    });
    return result.data;
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

        if (options.log) console.log('Sending', header);

        this.connectionCount += 1;
        this.client.write(header);
        this.client.setKeepAlive(true, 1000);
        NetKeepAlive.setKeepAliveInterval(this.client, 5000);
        NetKeepAlive.setKeepAliveProbes(this.client, 12);
        this.handleConnection();
      },
    );

    this.client.on('data', (data) => {
      if (this.isAuthenticated) this.handleData(data);
      else this.handleAuthResponse(data);
    });

    this.client.on('close', (hadError) => {
      // Try to reconnect after specified time frame (default 30 seconds)
      if (hadError && options.log) console.warn('We had error when closing');

      if (this.connectionCount <= 2) {
        this.connect();
        return;
      }

      setTimeout(() => {
        this.connect();
      }, options.reconnectAfter);

      this.handleEnd();
    });

    this.client.on('error', (err) => {
      this.handleError(err);
    });
  }

  private handleConnection() {
    if (this.options.log)
      console.log(
        'Connected to ' + this.options.host + ':' + this.options.port,
      );

    if (this.isAuthenticated || this.usingAuthDigest) this.emit('connect');
  }

  private handleEnd() {
    if (this.options.log) console.log('Connection closed!');
    this.emit('end');
  }

  private handleError(err: Error) {
    if (this.options.log) console.log('Connection error: ' + err);
    this.emit('error', err);
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

  private handleData(data: Buffer) {
    this.parser.parseString(data, (err, result) => {
      if (result) {
        const alert = result['EventNotificationAlert'];

        if (!alert) {
          console.warn('No alert in result', data.toString());
          return;
        }

        let code = alert['eventType'][0];
        let action = alert['eventState'][0];
        const index = parseInt(alert['channelID'][0]);

        const count = parseInt(alert['activePostCount'][0]);

        // give codes returned by camera prettier and standardized description
        if (code === 'IO') code = 'AlarmLocal';
        if (code === 'VMD') code = 'VideoMotion';
        if (code === 'linedetection') code = 'LineDetection';
        if (code === 'videoloss') code = 'VideoLoss';
        if (code === 'shelteralarm') code = 'VideoBlind';
        if (action === 'active') action = 'Start';
        if (action === 'inactive') action = 'Stop';

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
                if (this.options.log)
                  console.log(
                    'Ending Event: ' +
                      i +
                      ' - ' +
                      details.code +
                      ' - ' +
                      (Date.now() - details.lastTimestamp) / 1000,
                  );
                this.emit('alarm', details.code, 'Stop', details.index);
              }
            }
            this.activeEvents = {};
            this.triggerActive = false;
          } else {
            // should be the most common result
            // Nothing interesting happening and we haven't seen any events
            if (this.options.log) this.emit('alarm', code, action, index);
          }
        }

        // if the first instance of an eventIdentifier, lets emit it,
        // add to activeEvents and set triggerActive
        else if (
          typeof this.activeEvents[eventIdentifier] == 'undefined' ||
          this.activeEvents[eventIdentifier] == null
        ) {
          this.activeEvents[eventIdentifier] = {
            code,
            index,
            lastTimestamp: Date.now(),
          };
          this.emit('alarm', code, action, index);
          this.triggerActive = true;

          // known active events
        } else {
          if (this.options.log)
            console.log(
              '    Skipped Event: ' +
                code +
                ' ' +
                action +
                ' ' +
                index +
                ' ' +
                count,
            );

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
              if (this.options.log)
                console.log(
                  '    Ending Event: ' +
                    eventIdentifier +
                    ' - ' +
                    details.code +
                    ' - ' +
                    (Date.now() - details.lastTimestamp) / 1000,
                );
              this.emit('alarm', details.code, 'Stop', details.index);
              delete this.activeEvents[eventIdentifier];
            }
          });
        }
      }
    });
  }

  private parseStatus(data: Buffer) {
    return new Promise<HikVisionDeviceStatus>((resolve, reject) => {
      this.parser.parseString(data, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const deviceStatus = result['DeviceStatus'];

        resolve({
          deviceUpTime: parseInt(deviceStatus['deviceUpTime'][0]),
          currentDeviceTime: deviceStatus['currentDeviceTime'][0],
          cpu: {
            description:
              deviceStatus['CPUList'][0]['CPU'][0]['cpuDescription'][0],
            utilization: parseInt(
              deviceStatus['CPUList'][0]['CPU'][0]['cpuUtilization'][0],
            ),
          },
          memory: {
            description:
              deviceStatus['MemoryList'][0]['Memory'][0][
                'memoryDescription'
              ][0],
            usage: parseInt(
              deviceStatus['MemoryList'][0]['Memory'][0]['memoryUsage'][0],
            ),
            available: parseInt(
              deviceStatus['MemoryList'][0]['Memory'][0]['memoryAvailable'][0],
            ),
          },
        });
      });
    });
  }
}
