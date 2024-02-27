"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const node_timers_1 = require("node:timers");
const camera = new index_1.HikVision({
    username: 'admin',
    password: process.argv[3],
    host: process.argv[2],
    debug: true,
    protocol: 'http',
    port: 80,
});
let connectionTimeout;
const setConnectionTimeout = () => {
    if (connectionTimeout)
        (0, node_timers_1.clearTimeout)(connectionTimeout);
    console.log('Connection closing in 15 seconds unless an Alarm event occurs');
    connectionTimeout = setTimeout(() => {
        camera.close();
    }, 5000 * 3);
};
camera.on('connect', () => {
    Promise.all([
        camera.getOnvifUsers(),
        camera.getStatus(),
        camera.getStreamingStatus(),
    ]).then((result) => {
        console.log(result);
        setConnectionTimeout();
    });
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
        console.log('Channel ' + channelID + ': Local Alarm Triggered: ' + channelID);
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
    setConnectionTimeout();
});
