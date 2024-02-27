import { HikVision } from '../src';

const camera = new HikVision({
  username: process.argv[4] || 'admin',
  password: process.argv[3],
  host: process.argv[2],
  debug: true,
});

camera.once('connect', () => {
  camera.getStreamingCapabilities().then((capabilities) => {
    console.log(JSON.stringify(capabilities, null, 2));

    camera.close();
  });
});
