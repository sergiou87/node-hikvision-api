# node-hikvision-api

[![GPL-3.0](https://img.shields.io/badge/license-GPL-blue.svg)]()
[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![node](https://img.shields.io/node/v/gh-badges.svg)]()

NodeJS Module for communication with HikVision IP Cameras.

Now updated with Typescript and proper ISAPI calls.


## Status: Work in Progress

The security/encryption process is especially broken

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
ts-node src/examples/01-camera.ts 10.1.8.240 password  
 ```

## Major Differences

The previous version of this library had PTZ functionalities, 
however this is not within the scope of this library in my own opinion, you should be using
ONVIF for those functions.
