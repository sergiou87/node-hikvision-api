export type MotionDetection = {
  enabled: boolean;
  enableHighlight: boolean;
  samplingInterval: number;
  startTriggerTime: number;
  endTriggerTime: number;
  regionType: string;
  Grid: {
    rowGranularity: number;
    columnGranularity: number;
  };
  MotionDetectionLayout: {
    sensitivityLevel: number;
    layout: {
      gridMap: string;
    };
    targetType: string;
  };
};
