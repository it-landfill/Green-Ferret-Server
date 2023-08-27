export enum CommunicationProtocol {
  NONE = 'NONE',
  MQTT = 'MQTT',
  HTTP = 'HTTP',
  COAP = 'COAP',
}

export enum TriggerType {
  DISTANCE = 'DISTANCE',
  TIME = 'TIME',
}

//TODO: Cosa devo mettere??
export enum DistanceMethod {
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
}

interface DeviceConfig {
  protocol: CommunicationProtocol;
  trigger: TriggerType;
  distanceMethod: DistanceMethod;
  distance: number;
  time: number;
}

export interface DeviceModel {
  id: string;
  config: DeviceConfig;
}

export function generateNewDevice(id: string) {
  return {
    id: id,
    config: {
      protocol: CommunicationProtocol.MQTT,
      trigger: TriggerType.TIME,
      distanceMethod: DistanceMethod.LESS_THAN,
      distance: 1,
      time: 10, // 10 seconds
    },
  };
}
