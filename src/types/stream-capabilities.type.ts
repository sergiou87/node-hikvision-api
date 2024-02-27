import {
  NumberCurrentOptions,
  NumberMinMaxCurrent,
  NumberMinMaxDefault,
  StringCurrentOptions,
} from './validators.type';

export type StreamCapabilities = {
  Transport: {
    ControlProtocolList: {
      ControlProtocol: {
        streamingTransport: StringCurrentOptions;
      };
    };
    Multicast: {
      videoDestPortNo: NumberMinMaxDefault;
      audioDestPortNo: NumberMinMaxDefault;
    };
    Security: {
      certificateType: StringCurrentOptions;
      SecurityAlgorithm: {
        algorithmType: StringCurrentOptions;
      };
    };
    SRTPMulticast: {
      SRTPVideoDestPortNo: NumberMinMaxDefault;
      SRTPAudioDestPortNo: NumberMinMaxDefault;
    };
  };
  Video: {
    videoCodecType: StringCurrentOptions;
    videoResolutionWidth: NumberCurrentOptions;
    videoResolutionHeight: NumberCurrentOptions;
    videoQualityControlType: StringCurrentOptions;
    constantBitRate: NumberMinMaxCurrent;
    fixedQuality: NumberCurrentOptions;
    vbrUpperCap: NumberMinMaxCurrent;
    maxFrameRate: NumberCurrentOptions;
    keyFrameInterval: NumberMinMaxCurrent;
    H264Profile: StringCurrentOptions;
    GovLength: NumberMinMaxCurrent;
    SVC: {
      SVCMode: StringCurrentOptions;
    };
    smoothing: NumberMinMaxCurrent;
    H265Profile: StringCurrentOptions;
  };
  Audio: {
    audioCompressionType: StringCurrentOptions;
  };
  isSpportDynamicCapWithCondition: boolean;
  isSupportSmartCodeWithoutReStart: boolean;
  isSupportRTCPCfg: boolean;
};
