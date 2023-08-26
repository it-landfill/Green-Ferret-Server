import { DeviceModel, generateNewDevice } from './DeviceModel';

export async function dbGetAllDeviceIDs(): Promise<string[]> {
  return ['abcd', 'defg', 'hijk'];
}

export async function dbGetDevice(id: string): Promise<DeviceModel> {
  return generateNewDevice(id);
}
