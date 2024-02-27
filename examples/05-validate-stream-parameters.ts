import { HikVision } from '../src';

const camera = new HikVision({
  username: process.argv[4] || 'admin',
  password: process.argv[3],
  host: process.argv[2],
  debug: true,
});

camera.once('connect', () => {
  camera
    .getStreamingChannel(101)
    .then((channel) => {
      // Make changes here and then validate the result

      /// Very invalid video width should return false
      channel.Video.videoResolutionWidth = 10000;

      return camera.validateStreamParameters(101, channel);
    })
    .then((validation) => {
      console.log(JSON.stringify(validation, null, 2));
      camera.close();
    });
});
