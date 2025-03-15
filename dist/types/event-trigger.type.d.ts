export type EventTriggerNotification = {
    id: string;
    notificationMethod: string;
    notificationRecurrence: string;
    notificationInterval: number;
    outputIOPortID: string;
    dynOutputIOPortID: string;
    videoInputID: string;
    dynVideoInputID: string;
    ptzAction: {
        ptzChannelID: string;
        actionName: string;
        actionNum: number;
    };
};
export type EventTrigger = {
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
    id: string;
    eventType: string;
    eventDescription: string;
    inputIOPortID: string;
    dynInputPortID: string;
    videoInputChannelID: string;
    dynVideoInputChannelID: string;
    intervalBetweenEvents: number;
    WLSensorID: string;
    EventTriggerNotificationList: EventTriggerNotification[];
};
