export type StreamCapabilities = {
    Transport: {
        ControlProtocolList: {
            ControlProtocol: {
                streamingTransport: {
                    current: string;
                    options: string[];
                };
            };
        };
        Multicast: {
            videoDestPortNo: {
                min: number;
                max: number;
                default: number;
            };
            audioDestPortNo: {
                min: number;
                max: number;
                default: number;
            };
        };
        Security: {
            certificateType: {
                current: string;
                options: string[];
            };
            SecurityAlgorithm: {
                algorithmType: {
                    current: string;
                    options: string[];
                };
            };
        };
        SRTPMulticast: {
            SRTPVideoDestPortNo: {
                min: number;
                max: number;
                default: number;
            };
            SRTPAudioDestPortNo: {
                min: number;
                max: number;
                default: number;
            };
        };
    };
    Video: {
        videoCodecType: {
            current: string;
            options: string[];
        };
        videoResolutionWidth: {
            current: number;
            options: number[];
        };
        videoResolutionHeight: {
            current: number;
            options: number[];
        };
        videoQualityControlType: {
            current: string;
            options: string[];
        };
        constantBitRate: {
            current: number;
            min: number;
            max: number;
        };
        fixedQuality: {
            current: number;
            options: number[];
        };
        vbrUpperCap: {
            current: number;
            min: number;
            max: number;
        };
        maxFrameRate: {
            current: number;
            options: string[];
        };
        keyFrameInterval: {
            current: number;
            min: number;
            max: number;
        };
        H264Profile: {
            current: string;
            options: string[];
        };
        GovLength: {
            current: number;
            min: number;
            max: number;
        };
        SVC: {
            enabled: {
                current: string;
                options: string[];
            };
            SVCMode: {
                current: string[];
                options: string[];
            };
        };
        smoothing: {
            current: number;
            min: number;
            max: number;
        };
        H265Profile: {
            current: string;
            options: string[];
        };
    };
    Audio: {
        audioCompressionType: {
            current: string;
            options: string[];
        };
    };
    isSpportDynamicCapWithCondition: boolean;
    isSupportSmartCodeWithoutReStart: boolean;
    isSupportRTCPCfg: boolean;
};
