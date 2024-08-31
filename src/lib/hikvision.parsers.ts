import { X2jOptions, XMLParser } from 'fast-xml-parser';
import {
  DeviceStatus,
  Integrations,
  NotificationAlert,
  OnvifUser,
  StreamingChannel,
  StreamingStatus,
  NetworkInterface,
  MotionDetection,
} from '../types';
import { PutResponse, RawCapabilityResponse } from '../responses';

const getXMLParser = (options?: X2jOptions) => {
  return new XMLParser({
    ignoreDeclaration: true,
    ...options,
  });
};

export const parseGeneric = (data: Buffer): any => {
  const parser = getXMLParser();

  return parser.parse(data);
};

export const parseCapabilities = (data: Buffer): RawCapabilityResponse => {
  const parser = getXMLParser({
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    attributeNamePrefix: 'prop_',
  });

  return parser.parse(data);
};

export const parseNetworkInterfaces = (data: Buffer): NetworkInterface[] => {
  const parser = getXMLParser({
    parseAttributeValue: true,
  });

  const parsed: {
    NetworkInterfaceList:
      | {
          NetworkInterface: NetworkInterface;
        }
      | {
          NetworkInterface: NetworkInterface;
        }[];
  } = parser.parse(data);

  if (Array.isArray(parsed.NetworkInterfaceList))
    return parsed.NetworkInterfaceList.map((i) => i.NetworkInterface);
  else return [parsed.NetworkInterfaceList.NetworkInterface];
};

export const parseNetworkInterface = (data: Buffer): NetworkInterface => {
  const parser = getXMLParser({
    parseAttributeValue: true,
  });

  const parsed: {
    NetworkInterface: NetworkInterface;
  } = parser.parse(data);

  return parsed.NetworkInterface;
};

export const parseMotionDetection = (data: Buffer): MotionDetection => {
  const parser = getXMLParser({
    parseAttributeValue: true,
  });

  const parsed: {
    MotionDetection: MotionDetection;
  } = parser.parse(data);

  return parsed.MotionDetection;
};

export const parseIntegrations = (data: Buffer): Integrations => {
  const parser = getXMLParser();

  const parsed: {
    Integrate: Integrations;
  } = parser.parse(data);

  return parsed.Integrate;
};

export const parseUsersList = (data: Buffer): OnvifUser[] => {
  const parser = getXMLParser();
  const structure: {
    UserList: {
      User: OnvifUser | OnvifUser[];
    };
  } = parser.parse(data);

  if (Array.isArray(structure.UserList.User)) return structure.UserList.User;

  return [structure.UserList.User];
};

export const parseStreamingStatus = (data: Buffer): StreamingStatus => {
  const parser = getXMLParser();
  const parsed: { StreamingStatus: StreamingStatus } = parser.parse(data);

  return parsed.StreamingStatus;
};

export const parseStreamingChannel = (data: Buffer): StreamingChannel => {
  const parser = getXMLParser();
  const parsed: { StreamingChannel: StreamingChannel } = parser.parse(data);

  return parsed.StreamingChannel;
};

export const parseStreamingChannels = (data: Buffer): StreamingChannel[] => {
  const parser = getXMLParser();
  const parsed: {
    StreamingChannelList: {
      StreamingChannel: StreamingChannel[];
    };
  } = parser.parse(data);

  return parsed.StreamingChannelList.StreamingChannel;
};

export const parsePutResponse = (data: Buffer) => {
  const parser = getXMLParser();
  const parsed: {
    ResponseStatus: PutResponse;
  } = parser.parse(data);

  return parsed.ResponseStatus;
};

export const parseStatus = (data: Buffer): DeviceStatus => {
  const parser = getXMLParser();
  const parsed: {
    DeviceStatus: DeviceStatus;
  } = parser.parse(data);

  return parsed.DeviceStatus;
};

export const parseAlert = (data: Buffer): NotificationAlert => {
  const parser = getXMLParser();

  const alertData: {
    EventNotificationAlert: NotificationAlert;
  } = parser.parse(data);

  const alert = alertData.EventNotificationAlert;

  switch (alert.eventType) {
    case 'IO':
      alert.eventType = 'AlarmLocal';
      break;
    case 'VMD':
      alert.eventType = 'VideoMotion';
      break;
    case 'linedetection':
      alert.eventType = 'LineDetection';
      break;
    case 'videoloss':
      alert.eventType = 'VideoLoss';
      break;
    case 'shelteralarm':
      alert.eventType = 'VideoBlind';
      break;
    case 'active':
      alert.eventType = 'Start';
      break;
    case 'inactive':
      alert.eventType = 'Stop';
      break;
  }

  return alert;
};
