import { XMLBuilder } from 'fast-xml-parser';
import {
  Integrations,
  MotionDetection,
  OnvifUserType,
  StreamingChannel,
} from '../types';
import { NetworkInterface } from '../types/network-interface.type';

/**
 * Build integrations object in raw XML
 * @param integrations
 */
export const buildIntegrations = (integrations: Integrations) => {
  const builder = new XMLBuilder({
    format: true,
  });

  const structure = {
    Integrate: integrations,
  };

  return builder.build(structure);
};

/**
 * Build video stream options
 * @param channel
 * @param channelID
 */
export const buildStreamOptions = (
  channel: StreamingChannel,
  channelID: number,
) => {
  const builder = new XMLBuilder({
    format: false,
    ignoreAttributes: false,
    attributeNamePrefix: 'attr_',
  });

  // Hacky fixes start
  channel.id = channelID;
  channel.Video['attr_xmlns'] = '';

  channel.Video.videoQualityControlType =
    channel.Video.videoQualityControlType.toLowerCase();

  // Done with that

  const structure = {
    StreamingChannel: {
      ...channel,
      attr_xmlns: 'http://www.hikvision.com/ver20/XMLSchema',
      attr_version: '2.0',
    },
  };

  return `<?xml version="1.0" encoding="UTF-8"?>${builder.build(structure)}`;
};

export const buildMotionDetection = (motionDetection: MotionDetection) => {
  const builder = new XMLBuilder({
    format: false,
    ignoreAttributes: false,
    attributeNamePrefix: 'attr_',
  });

  const structure = {
    MotionDetection: {
      ...motionDetection,
      attr_xmlns: 'http://www.hikvision.com/ver20/XMLSchema',
      attr_version: '2.0',
    },
  };

  return `<?xml version="1.0" encoding="UTF-8"?>${builder.build(structure)}`;
};

export const buildNetworkInterface = (networkInterface: NetworkInterface) => {
  const builder = new XMLBuilder({
    format: false,
    ignoreAttributes: false,
    attributeNamePrefix: 'attr_',
  });

  const structure = {
    NetworkInterface: {
      ...networkInterface,
      attr_xmlns: 'http://www.hikvision.com/ver20/XMLSchema',
      attr_version: '2.0',
    },
  };

  return `<?xml version="1.0" encoding="UTF-8"?>${builder.build(structure)}`;
};

/**
 * @param username
 * @param password
 * @param id
 * @param userType
 */
export const buildOnvifUser = (
  username: string,
  password: string,
  id: number,
  userType: OnvifUserType,
) => {
  const builder = new XMLBuilder({
    format: true,
  });

  const structure = {
    UserList: {
      User: {
        id,
        userName: username,
        password,
        userType,
      },
    },
  };

  return builder.build(structure);
};
