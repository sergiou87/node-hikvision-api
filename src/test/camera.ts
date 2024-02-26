import { HikVision } from '../index';

const camera = new HikVision({
  username: 'admin',
  password: '',
  host: '10.1.8.240',
  log: true,
});

camera.on('connect', () => {
  camera.checkStreamingStatus().then((result) => console.log(result));
});
