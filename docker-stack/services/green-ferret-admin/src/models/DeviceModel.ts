export enum CommunicationProtocol {
  NONE,
  MQTT,
  HTTP,
  COAP,
}

export enum TriggerType {
  DISTANCE,
  TIME,
}

//TODO: Cosa devo mettere??
export enum DistanceMethod {
  NAIVE,
  HAVERSINE,
  VINCENTY,
  SPHERICAL_LAW_OF_COSINES,
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
      distanceMethod: DistanceMethod.NAIVE,
      distance: 1,
      time: 10, // 10 seconds
    },
  };
}
