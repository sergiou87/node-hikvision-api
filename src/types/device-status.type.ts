export type DeviceStatus = {
  currentDeviceTime: string;
  deviceUpTime: number;
  CPUList: {
    CPU: {
      cpuDescription: string;
      cpuUtilization: number;
    };
  };
  MemoryList: {
    Memory: {
      memoryDescription: string;
      memoryUsage: number;
      memoryAvailable: number;
    };
  };
  CameraList: {
    Camera: {
      zoomReverseTimes: number;
      zoomTotalSteps: number;
      focusReverseTimes: number;
      focusTotalSteps: number;
      irisShiftTimes: number;
      irisTotalSteps: number;
      icrShiftTimes: number;
      icrTotalSteps: number;
      lensIntirTimes: number;
      cameraRunTotalTime: number;
    };
  };
  DomeInfoList: {
    DomeInfo: {
      domeRunTotalTime: number;
      runTimeUnderNegativetwenty: number;
      runTimeBetweenNtwentyPforty: number;
      runtimeOverPositiveforty: number;
      panTotalRounds: number;
      tiltTotalRounds: number;
      heatState: number;
      fanState: number;
      panFrecRecord: number;
      tiltFrecRecord: number;
    };
  };
  totalRebootCount: number;
  AlarmInfoList: {
    AlarmInfo: {
      channelId: number;
      FaceAlarm: {
        faceSnapRecvAlarm: number;
        faceSnapSendAlarm: number;
      };
      MixTargetAlarm: {
        mixTargetRecvAlarm: number;
        mixTargetSendAlarm: number;
      };
    };
  };
};
