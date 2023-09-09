'use server';

import {
  dbDeleteDevice,
  dbGetAllDeviceIDs,
  dbGetDevice,
  dbSaveDevice,
} from '@/models/Postgres';
import { DeviceModel } from './DeviceModel';

/**
 * Gets all device IDs from the database
 * @returns Array of all device IDs (strings)
 */
export async function getDeviceIDs(): Promise<string[]> {
  console.log('SA: getDeviceIDs');
  const res = await dbGetAllDeviceIDs();
  console.log(JSON.stringify(res));
  return res;
}

/**
 * Gets a device from the database
 * @param deviceID ID of the device to get
 * @returns DeviceModel object if the device exists, undefined otherwise
 */
export async function getDeviceInfo(
  deviceID: string,
): Promise<DeviceModel | undefined> {
  console.log('SA: getDevice: ' + deviceID);
  const res = await dbGetDevice(deviceID);
  console.log(JSON.stringify(res));
  return res;
}

/**
 * Saves a device to the database (if the device already exists, it will be updated)
 * The device will be marked as edited.
 * 
 * @param device DeviceModel object to save
 */
export async function saveDeviceInfo(device: DeviceModel) {
  console.log('SA: saveDevice: ' + JSON.stringify(device));
  await dbSaveDevice(device);
}

/**
 * Deletes a device from the database (sets the device's deleted flag to true)
 * @param deviceID ID of the device to delete
 */
export async function deleteDevice(deviceID: string) {
  console.log('SA: deleteDevice: ' + deviceID);
  await dbDeleteDevice(deviceID);
}
