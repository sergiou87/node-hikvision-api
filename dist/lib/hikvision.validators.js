"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStream = void 0;
const validateStream = (stream, capabilities) => {
    const invalidProperties = [];
    const validateObject = (object, capabilities) => {
        const hasChildren = (key) => {
            return key.charAt(0).toLowerCase() !== key.charAt(0);
        };
        const validateMinMax = (validator, value) => {
            return validator.min <= value && validator.max >= value;
        };
        const validateOptions = (validator, value) => {
            if (typeof value === 'number')
                return validator.options.includes(value);
            else
                return validator.options.includes(value);
        };
        Object.keys(object).forEach((key) => {
            if (!hasChildren(key) && !!capabilities[key]) {
                let capabilitiesValidator = capabilities[key];
                if (!capabilitiesValidator)
                    return;
                if (capabilitiesValidator.hasOwnProperty('default')) {
                    capabilitiesValidator = capabilitiesValidator;
                    if (!validateMinMax(capabilitiesValidator, object[key]))
                        invalidProperties.push({
                            key,
                            value: object[key],
                            validator: capabilitiesValidator,
                        });
                }
                else {
                    capabilitiesValidator = capabilitiesValidator;
                    if (capabilitiesValidator.hasOwnProperty('min') &&
                        capabilitiesValidator.hasOwnProperty('max')) {
                        capabilitiesValidator =
                            capabilitiesValidator;
                        if (!validateMinMax(capabilitiesValidator, object[key]))
                            invalidProperties.push({
                                key,
                                value: object[key],
                                validator: capabilitiesValidator,
                            });
                    }
                    else {
                        capabilitiesValidator = capabilitiesValidator;
                        if (!validateOptions(capabilitiesValidator, object[key]))
                            invalidProperties.push({
                                key,
                                value: object[key],
                                validator: capabilitiesValidator,
                            });
                    }
                }
            }
            else if (!!capabilities[key]) {
                validateObject(object[key], capabilities[key]);
            }
        });
    };
    validateObject(stream, capabilities);
    if (invalidProperties.length > 0) {
        return {
            valid: false,
            invalidProperties,
        };
    }
    return {
        valid: true,
    };
};
exports.validateStream = validateStream;
