export type StreamingChannel = {
  id: number;
  channelName: string;
  enabled: boolean;
  Transport: {
    maxPacketSize: number;
    ControlProtocolList: {
      ControlProtocol: Array<{
        streamingTransport: string;
      }>;
    };
    Unicast: {
      enabled: boolean;
      rtpTransportType: string;
    };
    Multicast: {
      enabled: boolean;
      destIPAddress: string;
      videoDestPortNo: number;
      audioDestPortNo: number;
      FecInfo: {
        fecRatio: number;
        fecDestPortNo: number;
      };
    };
    Security: {
      enabled: boolean;
      certificateType: string;
      SecurityAlgorithm: {
        algorithmType: string;
      };
    };
  };
  Video: {
    enabled: boolean;
    videoInputChannelID: number;
    videoCodecType: string;
    videoScanType: string;
    videoResolutionWidth: number;
    videoResolutionHeight: number;
    videoQualityControlType: string;
    constantBitRate: number;
    fixedQuality: number;
    vbrUpperCap: number;
    vbrLowerCap: number;
    maxFrameRate: number;
    keyFrameInterval: number;
    snapShotImageType: string;
    H264Profile?: string;
    GovLength: number;
    SVC: {
      enabled: boolean;
    };
    PacketType: Array<string>;
    smoothing: number;
    H265Profile?: string;
    SmartCodec: {
      enabled: boolean;
    };
  };
  Audio: {
    enabled: boolean;
    audioInputChannelID: number;
    audioCompressionType: string;
  };
};
