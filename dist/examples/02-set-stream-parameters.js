"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const camera = new index_1.HikVision({
    username: 'admin',
    password: process.argv[3],
    host: process.argv[2],
    debug: true,
});
camera.once('connect', () => {
    doCameraActions().then(() => {
        camera.close();
    });
});
const doCameraActions = async () => {
    const resultOne = await camera.getStreamingChannel(101).then((channel) => {
        channel.Video.videoCodecType = 'H.265';
        channel.Video.maxFrameRate = 2500;
        channel.Video.SVC.enabled = true;
        channel.Video.H265Profile = 'Main';
        channel.Video.smoothing = 50;
        return camera.updateStreamingChannel(101, channel);
    });
    const resultTwo = await camera.getStreamingChannel(102).then((channel) => {
        channel.Video.videoCodecType = 'H.265';
        channel.Video.maxFrameRate = 2500;
        channel.Video.SVC.enabled = false;
        channel.Video.H265Profile = 'Main';
        channel.Video.smoothing = 50;
        channel.Video.vbrUpperCap = 1024;
        channel.Video.videoQualityControlType = 'vbr';
        delete channel.Video.vbrLowerCap;
        delete channel.Video.keyFrameInterval;
        delete channel.Video.snapShotImageType;
        delete channel.Video.videoScanType;
        delete channel.Video.constantBitRate;
        delete channel.Video.vbrLowerCap;
        delete channel.Video.PacketType;
        return camera.updateStreamingChannel(102, channel);
    });
    console.log(resultOne);
    console.log(resultTwo);
};
