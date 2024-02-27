export type HikVisionOptions = {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  username: string;
  password: string;
  debug: boolean;
  reconnectAfter: number;
  logger: (message?: any, ...optionalParams: any[]) => any;
};

export type HikVisionPartialOptions = {
  host: string;
  port?: number;
  protocol?: 'http' | 'https';
  username: string;
  password: string;
  debug?: boolean;
  reconnectAfter?: number;
  logger?: (message?: any, ...optionalParams: any[]) => any;
};
