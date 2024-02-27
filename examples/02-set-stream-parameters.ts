import { HikVision } from '../src';

const camera = new HikVision({
  username: process.argv[4] || 'admin',
  password: process.argv[3],
  host: process.argv[2],
  debug: true,
});

camera
  .getStreamingChannel(101)
  .then((channel) => {
    channel.Video.videoCodecType = 'H.265';
    channel.Video.maxFrameRate = 2500;
    channel.Video.H265Profile = 'Main';

    return camera.updateStreamingChannel(101, channel);
  })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });

camera
  .getStreamingChannel(102)
  .then((channel) => {
    channel.Video.videoCodecType = 'H.265';
    channel.Video.maxFrameRate = 2500;
    channel.Video.H265Profile = 'Main';
    channel.Video.vbrUpperCap = 1024;

    return camera.updateStreamingChannel(102, channel);
  })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });
