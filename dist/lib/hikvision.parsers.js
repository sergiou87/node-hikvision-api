"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAlert = exports.parseStatus = exports.parsePutResponse = exports.parseStreamingChannels = exports.parseStreamingChannel = exports.parseStreamingStatus = exports.parseUsersList = exports.parseIntegrations = exports.parseNetworkInterface = exports.parseNetworkInterfaces = exports.parseCapabilities = exports.parseGeneric = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
const getXMLParser = (options) => {
    return new fast_xml_parser_1.XMLParser({
        ignoreDeclaration: true,
        ...options,
    });
};
const parseGeneric = (data) => {
    const parser = getXMLParser();
    return parser.parse(data);
};
exports.parseGeneric = parseGeneric;
const parseCapabilities = (data) => {
    const parser = getXMLParser({
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        parseAttributeValue: true,
        attributeNamePrefix: 'prop_',
    });
    return parser.parse(data);
};
exports.parseCapabilities = parseCapabilities;
const parseNetworkInterfaces = (data) => {
    const parser = getXMLParser({
        parseAttributeValue: true,
    });
    const parsed = parser.parse(data);
    if (Array.isArray(parsed.NetworkInterfaceList))
        return parsed.NetworkInterfaceList.map((i) => i.NetworkInterface);
    else
        return [parsed.NetworkInterfaceList.NetworkInterface];
};
exports.parseNetworkInterfaces = parseNetworkInterfaces;
const parseNetworkInterface = (data) => {
    const parser = getXMLParser({
        parseAttributeValue: true,
    });
    const parsed = parser.parse(data);
    return parsed.NetworkInterface;
};
exports.parseNetworkInterface = parseNetworkInterface;
const parseIntegrations = (data) => {
    const parser = getXMLParser();
    const parsed = parser.parse(data);
    return parsed.Integrate;
};
exports.parseIntegrations = parseIntegrations;
const parseUsersList = (data) => {
    const parser = getXMLParser();
    const structure = parser.parse(data);
    if (Array.isArray(structure.UserList.User))
        return structure.UserList.User;
    return [structure.UserList.User];
};
exports.parseUsersList = parseUsersList;
const parseStreamingStatus = (data) => {
    const parser = getXMLParser();
    const parsed = parser.parse(data);
    return parsed.StreamingStatus;
};
exports.parseStreamingStatus = parseStreamingStatus;
const parseStreamingChannel = (data) => {
    const parser = getXMLParser();
    const parsed = parser.parse(data);
    return parsed.StreamingChannel;
};
exports.parseStreamingChannel = parseStreamingChannel;
const parseStreamingChannels = (data) => {
    const parser = getXMLParser();
    const parsed = parser.parse(data);
    return parsed.StreamingChannelList.StreamingChannel;
};
exports.parseStreamingChannels = parseStreamingChannels;
const parsePutResponse = (data) => {
    const parser = getXMLParser();
    const parsed = parser.parse(data);
    return parsed.ResponseStatus;
};
exports.parsePutResponse = parsePutResponse;
const parseStatus = (data) => {
    const parser = getXMLParser();
    const parsed = parser.parse(data);
    return parsed.DeviceStatus;
};
exports.parseStatus = parseStatus;
const parseAlert = (data) => {
    const parser = getXMLParser();
    const alertData = parser.parse(data);
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
exports.parseAlert = parseAlert;
