import { HikVision } from '../dist';

const camera = new HikVision({
  username: 'admin',
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
