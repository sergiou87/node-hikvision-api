export type RawCapabilityResponse = {
  StreamingChannel: {
    id: {
      '#text': number;
      prop_opt: string;
    };
    channelName: string;
    enabled: {
      '#text': boolean;
      prop_opt: boolean;
    };
    Transport: {
      maxPacketSize: {
        '#text': number;
        prop_opt: number;
      };
      ControlProtocolList: {
        ControlProtocol: {
          streamingTransport: {
            '#text': string;
            prop_opt: string;
          };
        };
      };
      Multicast: {
        enabled: {
          prop_opt: string;
        };
        videoDestPortNo: {
          prop_min: number;
          prop_max: number;
          prop_default: number;
        };
        audioDestPortNo: {
          prop_min: number;
          prop_max: number;
          prop_default: number;
        };
      };
      Unicast: {
        enabled: {
          '#text': boolean;
          prop_opt: boolean;
        };
        rtpTransportType: {
          '#text': string;
          prop_opt: string;
        };
      };
      Security: {
        enabled: {
          '#text': boolean;
          prop_opt: boolean;
        };
        certificateType: {
          '#text': string;
          prop_opt: string;
        };
        SecurityAlgorithm: {
          algorithmType: {
            prop_opt: string;
          };
        };
      };
      SRTPMulticast: {
        SRTPVideoDestPortNo: {
          prop_min: number;
          prop_max: number;
          prop_default: number;
        };
        SRTPAudioDestPortNo: {
          prop_min: number;
          prop_max: number;
          prop_default: number;
        };
      };
    };
    Video: {
      enabled: {
        '#text': boolean;
        prop_opt: boolean;
      };
      videoInputChannelID: {
        '#text': number;
        prop_opt: number;
      };
      videoCodecType: {
        '#text': string;
        prop_opt: string;
      };
      videoScanType: {
        '#text': string;
        prop_opt: string;
      };
      videoResolutionWidth: {
        '#text': number;
        prop_opt: string;
      };
      videoResolutionHeight: {
        '#text': number;
        prop_opt: string;
      };
      videoQualityControlType: {
        '#text': string;
        prop_opt: string;
      };
      constantBitRate: {
        '#text': number;
        prop_min: number;
        prop_max: number;
      };
      fixedQuality: {
        '#text': number;
        prop_opt: string;
      };
      vbrUpperCap: {
        '#text': number;
        prop_min: number;
        prop_max: number;
      };
      vbrLowerCap: number;
      maxFrameRate: {
        '#text': number;
        prop_opt: string;
      };
      keyFrameInterval: {
        '#text': number;
        prop_min: number;
        prop_max: number;
      };
      snapShotImageType: {
        '#text': string;
        prop_opt: string;
      };
      H264Profile: {
        '#text': string;
        prop_opt: string;
      };
      GovLength: {
        '#text': number;
        prop_min: number;
        prop_max: number;
      };
      SVC: {
        enabled: {
          '#text': boolean;
          prop_opt: string;
        };
        SVCMode: {
          '#text': string;
          prop_opt: string;
        };
      };
      smoothing: {
        '#text': number;
        prop_min: number;
        prop_max: number;
      };
      H265Profile: {
        '#text': string;
        prop_opt: string;
      };
    };
    Audio: {
      enabled: {
        '#text': boolean;
        prop_opt: string;
      };
      audioInputChannelID: number;
      audioCompressionType: {
        '#text': string;
        prop_opt: string;
      };
    };
    isSpportDynamicCapWithCondition: boolean;
    isSupportSmartCodeWithoutReStart: boolean;
    isSupportRTCPCfg: boolean;
    prop_version: number;
    prop_xmlns: string;
  };
};
