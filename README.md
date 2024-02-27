# node-hikvision-api

[![GPL-3.0](https://img.shields.io/badge/license-GPL-blue.svg)]()
[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![node](https://img.shields.io/node/v/gh-badges.svg)]()

NodeJS Module for communication with HikVision IP Cameras.

Now updated with Typescript and proper ISAPI calls.


## Status: Work in Progress

The security/encryption process is especially broken

### Working:

* View/update stream channel parameters
* Get device status
* Enable/disable ONVIF
* Add/remove ONVIF users
* Checking for day mode/night mode
* Camera alarm handling (see below)

### Encryption:

Though HikVision's ISAPI protocol supports security using URL parameters, I was unable to get it working properly.
Anyone is welcome to pick up where I left off in `src/lib/hikvision.encryption.ts`.

The ISAPI [spec](./repo/isapi.pdf) includes the full steps in Chapter 3, but this is the general idea:
![ISAPI encryption steps](./repo/enc-steps-2.png)
![ISAPI encryption steps](./repo/enc-steps.png)

**Without encryption** one should _not_ use this library to pass sensitive data _at all_


### Notes

**There are major differences between this library (which was forked) and the original one**

For instance, the previous version of this library had PTZ functionalities,
however this is not within the scope of this library. In my own opinion, you should be using
ONVIF for those functions.


## Example:
```typescript
import { HikVision } from '@copcart/node-hikvision-api';

// Options are now a standalone type
const camera = new HikVision({
  username: 'admin',
  password: 'password',
  host: '192.168.1.64',
  debug: true,
  port: 80,
  reconnectAfter: 30000,
});

camera.on('connect', () => {
  camera.getOnvifUsers().then(console.log);
  camera.getStatus().then(console.log);
  camera.getStreamingStatus().then(console.log);
});



camera.on('alarm', (eventType, eventState, channelID) => {
  if (eventType === 'VideoMotion' && eventState === 'Start')
    console.log('Channel ' + channelID + ': Video Motion Detected');
  if (eventType === 'VideoMotion' && eventState === 'Stop')
    console.log('Channel ' + channelID + ': Video Motion Ended');
  if (eventType === 'LineDetection' && eventState === 'Start')
    console.log('Channel ' + channelID + ': Line Cross Detected');
  if (eventType === 'LineDetection' && eventState === 'Stop')
    console.log('Channel ' + channelID + ': Line Cross Ended');
  if (eventType === 'AlarmLocal' && eventState === 'Start')
    console.log(
      'Channel ' + channelID + ': Local Alarm Triggered: ' + channelID,
    );
  if (eventType === 'AlarmLocal' && eventState === 'Stop')
    console.log('Channel ' + channelID + ': Local Alarm Ended: ' + channelID);
  if (eventType === 'VideoLoss' && eventState === 'Start')
    console.log('Channel ' + channelID + ': Video Lost!');
  if (eventType === 'VideoLoss' && eventState === 'Stop')
    console.log('Channel ' + channelID + ': Video Found!');
  if (eventType === 'VideoBlind' && eventState === 'Start')
    console.log('Channel ' + channelID + ': Video Blind!');
  if (eventType === 'VideoBlind' && eventState === 'Stop')
    console.log('Channel ' + channelID + ': Video Unblind!');
});
```

You can run a very similar example available within the repository:
```shell
ts-node src/examples/01-basic.ts 10.1.8.240 password  
 ```
