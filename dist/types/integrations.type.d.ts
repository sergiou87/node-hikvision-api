export type Integrations = {
    ONVIF: {
        enable: boolean;
    };
    ISAPI: {
        enable: boolean;
    };
    CGI: {
        enable: boolean;
        certificateType: 'digest' | 'digest/basic';
    };
};
