"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOnvifUser = exports.buildNetworkInterface = exports.buildStreamOptions = exports.buildIntegrations = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
/**
 * Build integrations object in raw XML
 * @param integrations
 */
const buildIntegrations = (integrations) => {
    const builder = new fast_xml_parser_1.XMLBuilder({
        format: true,
    });
    const structure = {
        Integrate: integrations,
    };
    return builder.build(structure);
};
exports.buildIntegrations = buildIntegrations;
/**
 * Build video stream options
 * @param channel
 * @param channelID
 */
const buildStreamOptions = (channel, channelID) => {
    const builder = new fast_xml_parser_1.XMLBuilder({
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
exports.buildStreamOptions = buildStreamOptions;
const buildNetworkInterface = (networkInterface) => {
    const builder = new fast_xml_parser_1.XMLBuilder({
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
exports.buildNetworkInterface = buildNetworkInterface;
/**
 * @param username
 * @param password
 * @param id
 * @param userType
 */
const buildOnvifUser = (username, password, id, userType) => {
    const builder = new fast_xml_parser_1.XMLBuilder({
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
exports.buildOnvifUser = buildOnvifUser;
