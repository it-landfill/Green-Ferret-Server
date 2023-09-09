import React from 'react';
import ConfigPanel from './components/ConfigPanel';
import { BiArrowBack } from 'react-icons/bi';
import Link from 'next/link';
import { DeviceModel } from '@/models/DeviceModel';
import { notFound } from 'next/navigation';
import { getDeviceInfo } from '@/models/ServerActions';
import DeleteButton from './components/DeleteButton';

interface Props {
  params: {
    deviceID: string;
  };
}

async function getData(deviceID: string): Promise<DeviceModel | undefined> {
  console.log('getData specific called');
  const respObj = await getDeviceInfo(deviceID);

  console.log(respObj);

  return respObj;
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
          className="mr-2 flex flex-row rounded-lg bg-green-600 bg-opacity-90 px-5 font-semibold text-white hover:bg-opacity-100 focus:outline-none"
        >
          <div className="flex flex-row self-center">
            <BiArrowBack className="mr-2 text-2xl" />
            <p className="font-medium"> Back</p>
          </div>
        </Link>
        <p className="roundede grow p-2 text-center text-xl">
          Device: <b>{device.id}</b>
        </p>
        < DeleteButton deviceID={device.id}/>
      </div>
      <div className="mt-3 flex flex-col rounded">
        <ConfigPanel deviceIn={device} />
      </div>
    </div>
  );
};

export default DeviceInfo;
