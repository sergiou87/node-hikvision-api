import { HikVision } from '../src';

const camera = new HikVision({
  username: 'admin',
  password: process.argv[3],
  host: process.argv[2],
  debug: true,
});

camera.once('connect', () => {
  camera.getStreamingChannel(101).then((channel) => {
    // Make changes here
    return camera.validateStreamingChannel(101, channel)
  }).then(validation => {
    console.log(JSON.stringify(validation, null, 2));
  })
});
