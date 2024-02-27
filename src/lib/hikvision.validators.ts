import {
  NumberCurrentOptions,
  NumberMinMaxCurrent,
  NumberMinMaxDefault,
  StreamingChannel,
  StringCurrentOptions,
} from '../types';
import { StreamCapabilities } from '../types/stream-capabilities.type';

export const validateStream = (
  stream: StreamingChannel,
  capabilities: StreamCapabilities,
) => {
  const invalidProperties: { key: string; value: any; validator: any }[] = [];

  const validateObject = (
    object: { [key: string]: any },
    capabilities: any,
  ) => {
    const hasChildren = (key: string) => {
      return key.charAt(0).toLowerCase() !== key.charAt(0);
    };

    const validateMinMax = (
      validator: NumberMinMaxDefault | NumberMinMaxCurrent,
      value: number,
    ) => {
      return validator.min <= value && validator.max >= value;
    };

    const validateOptions = (
      validator: NumberCurrentOptions | StringCurrentOptions,
      value: number | string,
    ) => {
      if (typeof value === 'number')
        return (validator as NumberCurrentOptions).options.includes(value);
      else return (validator as StringCurrentOptions).options.includes(value);
    };

    Object.keys(object).forEach((key) => {
      if (!hasChildren(key) && !!capabilities[key]) {
        let capabilitiesValidator:
          | StringCurrentOptions
          | NumberCurrentOptions
          | NumberMinMaxDefault
          | NumberMinMaxCurrent = capabilities[key];

        if (!capabilitiesValidator) return;

        if (capabilitiesValidator.hasOwnProperty('default')) {
          capabilitiesValidator = capabilitiesValidator as NumberMinMaxDefault;

          if (!validateMinMax(capabilitiesValidator, object[key]))
            invalidProperties.push({
              key,
              value: object[key],
              validator: capabilitiesValidator,
            });
        } else {
          capabilitiesValidator = capabilitiesValidator as
            | NumberMinMaxCurrent
            | NumberCurrentOptions
            | StringCurrentOptions;

          if (
            capabilitiesValidator.hasOwnProperty('min') &&
            capabilitiesValidator.hasOwnProperty('max')
          ) {
            capabilitiesValidator =
              capabilitiesValidator as NumberMinMaxCurrent;
            if (!validateMinMax(capabilitiesValidator, object[key]))
              invalidProperties.push({
                key,
                value: object[key],
                validator: capabilitiesValidator,
              });
          } else {
            capabilitiesValidator = capabilitiesValidator as
              | NumberCurrentOptions
              | StringCurrentOptions;

            if (!validateOptions(capabilitiesValidator, object[key]))
              invalidProperties.push({
                key,
                value: object[key],
                validator: capabilitiesValidator,
              });
          }
        }
      } else if (!!capabilities[key]) {
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
