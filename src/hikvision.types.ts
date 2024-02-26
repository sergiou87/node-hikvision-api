export type HikVisionDeviceStatus = {
  currentDeviceTime: string;
  deviceUpTime: number;
  memory: {
    usage: number;
    available: number;
    description: string;
  };
  cpu: {
    description: string;
    utilization: number;
  };
};

export type HikVisionEvent = {
  code: string;
  index: number;
  lastTimestamp: number;
};

export type HikVisionOptions = {
  host: string;
  port: number;
  username: string;
  password: string;
  log: boolean;
  reconnectAfter: number;
};

export type HikVisionPartialOptions = {
  host: string;
  port?: number;
  username: string;
  password: string;
  log?: boolean;
  reconnectAfter?: number;
};
