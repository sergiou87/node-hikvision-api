import { HikVision } from '../index';

const camera = new HikVision({
  username: 'admin',
  password: process.argv[3],
  host: process.argv[2],
  debug: true,
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
