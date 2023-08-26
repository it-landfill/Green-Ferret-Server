import { dbGetDevice } from '@/models/Postgres';
import React from 'react';
import ConfigPanel from './components/ConfigPanel';
import { BiArrowBack } from 'react-icons/bi';
import Link from 'next/link';

interface Props {
  params: {
    deviceID: string;
  };
}

const DeviceInfo = async ({ params }: Props) => {
  console.log('Info for device: ' + params.deviceID);
  //TODO: What if the device does not exist?
  const device = await dbGetDevice(params.deviceID);

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
