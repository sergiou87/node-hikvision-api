"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOnvifUser = exports.buildStreamOptions = exports.buildIntegrations = void 0;
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
 */
const buildStreamOptions = (channel) => {
    const builder = new fast_xml_parser_1.XMLBuilder({
        format: true,
    });
    const structure = {
        StreamingChannel: channel,
    };
    return builder.build(structure);
};
exports.buildStreamOptions = buildStreamOptions;
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
