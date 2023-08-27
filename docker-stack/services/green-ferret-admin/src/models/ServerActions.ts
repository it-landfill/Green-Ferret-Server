'use server';

import {
  dbGetAllDeviceIDs,
  dbGetDevice,
  dbSaveDevice,
} from '@/models/Postgres';
import { DeviceModel } from './DeviceModel';

export async function getDeviceIDs(): Promise<string[]> {
  console.log('SA: getDeviceIDs');
  const res = await dbGetAllDeviceIDs();
  console.log(JSON.stringify(res));
  return res;
}

export async function getDeviceInfo(
  deviceID: string,
): Promise<DeviceModel | undefined> {
  console.log('SA: getDevice: ' + deviceID);
  const res = await dbGetDevice(deviceID);
  console.log(JSON.stringify(res));
  return res;
}

export async function saveDeviceInfo(device: DeviceModel) {
  console.log('SA: saveDevice: ' + JSON.stringify(device));
  await dbSaveDevice(device);
}
