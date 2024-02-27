export type HikVisionOptions = {
  host: string;
  port: number;
  username: string;
  password: string;
  debug: boolean;
  reconnectAfter: number;
};

export type HikVisionPartialOptions = {
  host: string;
  port?: number;
  username: string;
  password: string;
  debug?: boolean;
  reconnectAfter?: number;
};
