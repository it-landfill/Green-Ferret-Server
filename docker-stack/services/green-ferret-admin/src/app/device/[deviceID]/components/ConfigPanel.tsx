'use client';

import {
  CommunicationProtocol,
  DeviceModel,
  DistanceMethod,
  TriggerType,
} from '@/models/DeviceModel';
import { saveDeviceInfo } from '@/models/ServerActions';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Props {
  deviceIn: DeviceModel;
}

const ConfigPanel = ({ deviceIn }: Props) => {
  const [device, setDevice] = React.useState<DeviceModel>(deviceIn);
  const router = useRouter();
  
  return (
    <div className="flex flex-col space-y-6 rounded-lg border-4 p-10">
      <div className="flex flex-row">
        <label
          htmlFor="protocol"
          className="m-3 block text-base font-medium text-gray-900"
        >
          Protocol:
        </label>
        <select
          id="protocol"
          className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-900"
          value={device.config.protocol}
          onChange={(e) => {
            setDevice({
              ...device,
              config: {
                ...device.config,
                protocol: parseInt(e.target.value) as CommunicationProtocol,
              },
            });
          }}
        >
          {Object.keys(CommunicationProtocol)
            .filter((key) => isNaN(Number(key)))
            .map((key, index) => (
              <option key={key} value={index}>
                {key}
              </option>
            ))}
        </select>
      </div>
      <hr className="my-8 h-px border-0 bg-gray-200" />
      <div className="flex flex-row">
        <label
          htmlFor="trigger"
          className="m-3 block text-base font-medium text-gray-900"
        >
          Trigger:
        </label>
        <select
          id="trigger"
          className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-900"
          value={device.config.trigger}
          onChange={(e) => {
            setDevice({
              ...device,
              config: {
                ...device.config,
                trigger: parseInt(e.target.value) as TriggerType,
              },
            });
          }}
        >
          {Object.keys(TriggerType)
            .filter((key) => isNaN(Number(key)))
            .map((key, index) => (
              <option key={key} value={index}>
                {key}
              </option>
            ))}
        </select>
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
          <div className="flex flex-row gap-8">
            {/* Distance configuration */}
            <div className="flex flex-row">
              <label
                htmlFor="distanceMethod"
                className="text-basetext-base m-3 block font-medium text-gray-900"
              >
                Distance Method:
              </label>
              <select
                id="distanceMethod"
                className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-900"
                value={device.config.distanceMethod}
                onChange={(e) => {
                  setDevice({
                    ...device,
                    config: {
                      ...device.config,
                      distanceMethod: parseInt(
                        e.target.value,
                      ) as DistanceMethod,
                    },
                  });
                }}
              >
                {Object.keys(DistanceMethod)
                  .filter((key) => isNaN(Number(key)))
                  .map((key, index) => (
                    <option key={key} value={index}>
                      {key}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-row  flex-wrap">
              <label
                htmlFor="distance"
                className="text-basetext-base m-3 block font-medium text-gray-900"
              >
                Distance trigger (in meters):
              </label>
              <input
                id="distance"
                className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-900"
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
          <div className="flex">
            {/* Time configuration */}
            <label
              htmlFor="time"
              className="text-basetext-base m-3 block font-medium text-gray-900"
            >
              Time trigger (in seconds):
            </label>
            <input
              id="time"
              value={device.config.time}
              className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-900"
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
          className="rounded-lg bg-red-600 bg-opacity-90 px-8 py-2 font-semibold text-white hover:bg-opacity-100 focus:outline-none"
          onClick={() => {
            console.log('Resetting device: ' + device.id);
            setDevice(deviceIn);
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-lg bg-green-600 bg-opacity-90 px-8 py-2 font-semibold text-white hover:bg-opacity-100 focus:outline-none"
          onClick={async () => {
            console.log('Applying configuration to device: ' + device.id);
            console.log(device);
            await saveDeviceInfo(device);
            router.push('/');
            router.refresh();
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
