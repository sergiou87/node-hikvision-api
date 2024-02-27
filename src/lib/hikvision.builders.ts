import { XMLBuilder } from 'fast-xml-parser';
import { Integrations, OnvifUserType, StreamingChannel } from '../types';

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

  channel.id = channelID;
  channel.Video['attr_xmlns'] = '';

  const structure = {
    StreamingChannel: {
      ...channel,
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
