import { dbGetDevice } from '@/models/Postgres';
import React from 'react';
import ConfigPanel from './components/ConfigPanel';
import { BiArrowBack } from 'react-icons/bi';
import Link from 'next/link';
import { DeviceModel } from '@/models/DeviceModel';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    deviceID: string;
  };
}

async function getData(deviceID: string): Promise<DeviceModel | undefined> {
	console.log("getData specific called");
  const response = await fetch(
    'http://localhost:3000/api/getDeviceInfo/' + deviceID,{
		cache: "no-store" },
  );
  if (!response.ok) {
    return undefined;
  }
  const respObj = await response.json();

  console.log(respObj);

  if (respObj === undefined) return undefined;
  return respObj as DeviceModel;
}

const DeviceInfo = async ({ params }: Props) => {
  console.log('Info for device: ' + params.deviceID);
  const device = await getData(params.deviceID);

  if (device === undefined) {
    // If device is undefined, return 404
    notFound();
  }

  return (
    <div className="flex flex-col overflow-hidden rounded">
      <div className="flex flex-row">
        <Link
          href="/"
          className="mr-3 flex flex-row rounded-lg bg-blue-700 px-5 py-3 text-sm text-white"
        >
          <BiArrowBack className="mr-2 text-xl" />
          <p className="font-medium"> Back</p>
        </Link>
        <p className="grow rounded bg-white p-2 text-center text-xl">
          Device: <b>{device.id}</b>
        </p>
      </div>
      <div className="mt-3 flex flex-col rounded bg-white">
        <ConfigPanel deviceIn={device} />
      </div>
    </div>
  );
};

export default DeviceInfo;
