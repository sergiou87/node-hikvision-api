import { XMLParser } from 'fast-xml-parser';
import {
  DeviceStatus,
  Integrations,
  NotificationAlert,
  OnvifUser,
  StreamingChannel,
  StreamingStatus,
} from '../types';
import { PutResponse } from '../responses';

const getXMLParser = () => {
  return new XMLParser({
    ignoreDeclaration: true,
  });
};

export const parseGeneric = (data: Buffer): any => {
  const parser = getXMLParser();

  console.log(data.toString('utf-8'));

  return parser.parse(data);
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
