export type EventTriggerNotification = {
  id: string;
  notificationMethod: string;
  notificationRecurrence?: string;
  notificationInterval?: number;
  outputIOPortID?: string;
  dynOutputIOPortID?: string;
  videoInputID?: string;
  dynVideoInputID?: string;
  ptzAction?: {
    ptzChannelID: string;
    actionName: string;
    actionNum?: number;
  };
}

export type EventTrigger = {
  id: string;
  eventType: string;
  eventDescription?: string;
  inputIOPortID?: string;
  dynInputPortID?: string;
  videoInputChannelID?: string;
  dynVideoInputChannelID?: string;
  intervalBetweenEvents?: number;
  WLSensorID?: string;
  EventTriggerNotificationList?: EventTriggerNotification[];
};
