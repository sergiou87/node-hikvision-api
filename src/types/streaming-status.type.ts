export type StreamingStatus = {
  totalStreamingSessions: number;
  StreamingSessionStatusList: {
    clientAddress: {
      ipAddress: string;
    };
  }[];
};
