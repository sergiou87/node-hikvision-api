"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStreamCapabilities = void 0;
const formatStreamCapabilities = (raw) => {
    return {
        Transport: {
            ControlProtocolList: {
                ControlProtocol: {
                    streamingTransport: {
                        current: raw.StreamingChannel.Transport.ControlProtocolList.ControlProtocol
                            .streamingTransport['#text'],
                        options: raw.StreamingChannel.Transport.ControlProtocolList.ControlProtocol.streamingTransport.prop_opt.split(','),
                    },
                },
            },
            Multicast: {
                videoDestPortNo: {
                    min: raw.StreamingChannel.Transport.Multicast.videoDestPortNo
                        .prop_min,
                    max: raw.StreamingChannel.Transport.Multicast.videoDestPortNo
                        .prop_max,
                    default: raw.StreamingChannel.Transport.Multicast.videoDestPortNo
                        .prop_default,
                },
                audioDestPortNo: {
                    min: raw.StreamingChannel.Transport.Multicast.audioDestPortNo
                        .prop_min,
                    max: raw.StreamingChannel.Transport.Multicast.audioDestPortNo
                        .prop_max,
                    default: raw.StreamingChannel.Transport.Multicast.audioDestPortNo
                        .prop_default,
                },
            },
            Security: {
                certificateType: {
                    current: raw.StreamingChannel.Transport.Security.certificateType['#text'],
                    options: raw.StreamingChannel.Transport.Security.certificateType.prop_opt.split(','),
                },
                SecurityAlgorithm: {
                    algorithmType: {
                        current: raw.StreamingChannel.Transport.Security.SecurityAlgorithm.algorithmType.prop_opt.split(',')[0],
                        options: raw.StreamingChannel.Transport.Security.SecurityAlgorithm.algorithmType.prop_opt.split(','),
                    },
                },
            },
            SRTPMulticast: {
                SRTPVideoDestPortNo: {
                    min: raw.StreamingChannel.Transport.SRTPMulticast.SRTPVideoDestPortNo
                        .prop_min,
                    max: raw.StreamingChannel.Transport.SRTPMulticast.SRTPVideoDestPortNo
                        .prop_max,
                    default: raw.StreamingChannel.Transport.SRTPMulticast.SRTPVideoDestPortNo
                        .prop_default,
                },
                SRTPAudioDestPortNo: {
                    min: raw.StreamingChannel.Transport.SRTPMulticast.SRTPAudioDestPortNo
                        .prop_min,
                    max: raw.StreamingChannel.Transport.SRTPMulticast.SRTPAudioDestPortNo
                        .prop_max,
                    default: raw.StreamingChannel.Transport.SRTPMulticast.SRTPAudioDestPortNo
                        .prop_default,
                },
            },
        },
        Video: {
            videoCodecType: {
                current: raw.StreamingChannel.Video.videoCodecType['#text'],
                options: raw.StreamingChannel.Video.videoCodecType.prop_opt.split(','),
            },
            videoResolutionWidth: {
                current: raw.StreamingChannel.Video.videoResolutionWidth['#text'],
                options: raw.StreamingChannel.Video.videoResolutionWidth.prop_opt
                    .split(',')
                    .map((i) => parseInt(i)),
            },
            videoResolutionHeight: {
                current: raw.StreamingChannel.Video.videoResolutionHeight['#text'],
                options: raw.StreamingChannel.Video.videoResolutionHeight.prop_opt
                    .split(',')
                    .map((i) => parseInt(i)),
            },
            videoQualityControlType: {
                current: raw.StreamingChannel.Video.videoQualityControlType['#text'],
                options: raw.StreamingChannel.Video.videoQualityControlType.prop_opt.split(','),
            },
            constantBitRate: {
                current: raw.StreamingChannel.Video.constantBitRate['#text'],
                min: raw.StreamingChannel.Video.constantBitRate.prop_min,
                max: raw.StreamingChannel.Video.constantBitRate.prop_max,
            },
            fixedQuality: {
                current: raw.StreamingChannel.Video.fixedQuality['#text'],
                options: raw.StreamingChannel.Video.fixedQuality.prop_opt
                    .split(',')
                    .map((i) => parseInt(i)),
            },
            vbrUpperCap: {
                current: raw.StreamingChannel.Video.vbrUpperCap['#text'],
                min: raw.StreamingChannel.Video.vbrUpperCap.prop_min,
                max: raw.StreamingChannel.Video.vbrUpperCap.prop_max,
            },
            maxFrameRate: {
                current: raw.StreamingChannel.Video.maxFrameRate['#text'],
                options: raw.StreamingChannel.Video.maxFrameRate.prop_opt
                    .split(',')
                    .map((i) => parseInt(i)),
            },
            keyFrameInterval: {
                current: raw.StreamingChannel.Video.keyFrameInterval['#text'],
                min: raw.StreamingChannel.Video.keyFrameInterval.prop_min,
                max: raw.StreamingChannel.Video.keyFrameInterval.prop_max,
            },
            H264Profile: {
                current: raw.StreamingChannel.Video.H264Profile['#text'],
                options: raw.StreamingChannel.Video.H264Profile.prop_opt.split(','),
            },
            GovLength: {
                current: raw.StreamingChannel.Video.GovLength['#text'],
                min: raw.StreamingChannel.Video.GovLength.prop_min,
                max: raw.StreamingChannel.Video.GovLength.prop_max,
            },
            SVC: {
                SVCMode: {
                    current: raw.StreamingChannel.Video.SVC.SVCMode['#text'],
                    options: raw.StreamingChannel.Video.SVC.SVCMode.prop_opt.split(','),
                },
            },
            smoothing: {
                current: raw.StreamingChannel.Video.smoothing['#text'],
                min: raw.StreamingChannel.Video.smoothing.prop_min,
                max: raw.StreamingChannel.Video.smoothing.prop_max,
            },
            H265Profile: {
                current: raw.StreamingChannel.Video.H265Profile['#text'],
                options: raw.StreamingChannel.Video.H265Profile.prop_opt.split(','),
            },
        },
        Audio: {
            audioCompressionType: {
                current: raw.StreamingChannel.Audio.audioCompressionType['#text'],
                options: raw.StreamingChannel.Audio.audioCompressionType.prop_opt.split(','),
            },
        },
        isSpportDynamicCapWithCondition: raw.StreamingChannel.isSpportDynamicCapWithCondition,
        isSupportSmartCodeWithoutReStart: raw.StreamingChannel.isSupportSmartCodeWithoutReStart,
        isSupportRTCPCfg: raw.StreamingChannel.isSupportRTCPCfg,
    };
};
exports.formatStreamCapabilities = formatStreamCapabilities;
