'use client';

import {
  CommunicationProtocol,
  DeviceModel,
  DistanceMethod,
  TriggerType,
} from '@/models/DeviceModel';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Props {
  deviceIn: DeviceModel;
}

async function sendConfig(device: DeviceModel) {
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  var raw = JSON.stringify(device);

  var requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  const res = await fetch(
	//TODO: Automatically Change this to the correct URL
    'http://localhost:3000/api/saveDeviceInfo',
    requestOptions,
  );

  if (!res.ok) {
    throw new Error(res.statusText);
  }
}

const ConfigPanel = ({ deviceIn }: Props) => {
  const [device, setDevice] = React.useState<DeviceModel>(deviceIn);
  const router = useRouter();
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* 
			Generic drpodowns:
			- Communciation protocol and trigger type
		*/}
      <div className="flex flex-row flex-wrap justify-evenly">
        {/*
			Protocol selection
		*/}
        <div className="flex flex-row ">
          <div className="mb-2 mr-3 block">
            {/* TODO: Sarebbe bello centrare questa label verticalmente rispetto al select ma è al di fuori delle mie capacità... Cresp salvami tu */}
            <label
              htmlFor="protocol"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Protocol:
            </label>
          </div>
          <select
            id="protocol"
            className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
            value={device.config.protocol}
            onChange={(e) => {
              setDevice({
                ...device,
                config: {
                  ...device.config,
                  protocol: e.target.value as CommunicationProtocol,
                },
              });
            }}
          >
            {Object.keys(CommunicationProtocol).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        {/* 
			Trigger selection
		*/}
        <div className="flex flex-row">
          <div className="mb-2 mr-3 block">
            <label
              htmlFor="trigger"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Trigger:
            </label>
          </div>
          <select
            id="trigger"
            className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
            value={device.config.trigger}
            onChange={(e) => {
              setDevice({
                ...device,
                config: {
                  ...device.config,
                  trigger: e.target.value as TriggerType,
                },
              });
            }}
          >
            {Object.keys(TriggerType).map((key) => (
              <option key={key} value={key as TriggerType}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className="my-8 h-px border-0 bg-gray-200" />

      {
        /*
			Conditional dropdowns:
			- Depending on trigger type
			- if distance:
			---- Distance method
			---- Distance threshold
			- if time:
			---- Time threshold
		*/
        device.config.trigger === TriggerType.DISTANCE ? (
          <div className="flex flex-row flex-wrap justify-evenly">
            {/* Distance configuration */}
            <div className="flex flex-row">
              <div className="mb-2 mr-3 block">
                <label
                  htmlFor="distanceMethod"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Distance Method:
                </label>
              </div>
              <select
                id="distanceMethod"
                className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                value={device.config.distanceMethod}
                onChange={(e) => {
                  setDevice({
                    ...device,
                    config: {
                      ...device.config,
                      distanceMethod: e.target.value as DistanceMethod,
                    },
                  });
                }}
              >
                {Object.keys(DistanceMethod).map((key) => (
                  <option key={key} value={key as DistanceMethod}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row">
              <div className="mb-2 mr-3 block">
                <label
                  htmlFor="distance"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Distance trigger (in meters):
                </label>
              </div>
              <input
                id="distance"
                className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                value={device.config.distance}
                type="number"
                onChange={(e) => {
                  const tmpVal = parseInt(e.target.value);
                  setDevice({
                    ...device,
                    config: { ...device.config, distance: tmpVal },
                  });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-center">
            {/* Time configuration */}
            <div className="mb-2 block pr-3">
              <label htmlFor="time">Time trigger (in seconds):</label>
            </div>
            <input
              id="time"
              value={device.config.time}
              className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
              type="number"
              onChange={(e) => {
                const tmpVal = parseInt(e.target.value);
                setDevice({
                  ...device,
                  config: { ...device.config, time: tmpVal },
                });
              }}
            />
          </div>
        )
      }

      <hr className="my-8 h-px border-0 bg-gray-200" />

      {/* Apply and reset buttons */}
      <div className="flex flex-row flex-wrap justify-evenly">
        <button
          type="button"
          className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          onClick={() => {
            console.log('Resetting device: ' + device.id);
            setDevice(deviceIn);
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          onClick={async () => {
            console.log('Applying configuration to device: ' + device.id);
            console.log(device);
            await sendConfig(device);
            router.push('/');
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
