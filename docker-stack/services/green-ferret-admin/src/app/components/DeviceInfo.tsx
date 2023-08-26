'use client';

import React from 'react';
import { Button, TextInput, Label, Select } from 'flowbite-react';
import { Actions, StateModel } from '@/models/StateModel';
import {
  CommunicationProtocol,
  DeviceModel,
  DistanceMethod,
  TriggerType,
  deepCopyDevice,
} from '@/models/DeviceModel';
import { AiOutlineClose } from 'react-icons/ai';

interface Props {
  dispatch: React.Dispatch<Actions>;
  deviceIn: DeviceModel;
}

const DeviceInfo = ({ dispatch, deviceIn }: Props) => {
  const [device, setDevice] = React.useState<DeviceModel>(
    deepCopyDevice(deviceIn),
  );
  return (
    <div>
      <div
        hidden={device === undefined}
        className="fixed left-0 right-0 top-0 z-50 h-[calc(100%-1rem)] max-h-full w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0"
      >
        <div className="relative max-h-full w-full max-w-2xl">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Device <b>{device.id}</b>
              </h3>
              <button
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                type="button"
                onClick={() => {
                  setDevice(deepCopyDevice(deviceIn));
                  dispatch({ type: 'CLOSE_DEVICE' });
                }}
              >
                <AiOutlineClose className="h-5 w-5 text-gray-400" />
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="flex flex-col space-y-6 p-6">
              <div className="flex flex-row">
                <div className="mb-2 block">
                  <Label htmlFor="protocol" value="Protocol: " />
                </div>
                <Select
                  id="protocol"
                  required
                  defaultValue={device.config.protocol}
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
                </Select>
              </div>
              <div className="flex flex-row">
                <div className="mb-2 block">
                  <Label htmlFor="trigger" value="Trigger: " />
                </div>
                <Select
                  id="trigger"
                  required
                  defaultValue={device.config.trigger}
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
                </Select>
              </div>
              {device.config.trigger === TriggerType.DISTANCE ? (
                <div>
                  <div className="flex flex-row">
                    <div className="mb-2 block">
                      <Label
                        htmlFor="distanceMethod"
                        value="Distance Method: "
                      />
                    </div>
                    <Select
                      id="distanceMethod"
                      required
                      defaultValue={device.config.distanceMethod}
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
                    </Select>
                  </div>
                  <div className="flex flex-row">
                    <div className="mb-2 block">
                      <Label htmlFor="distance" value="Distance: " />
                    </div>
                    <TextInput
                      id="distance"
                      defaultValue={device.config.distance}
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
                <div className="flex flex-row">
                  <div className="mb-2 block">
                    <Label htmlFor="time" value="Time: " />
                  </div>
                  <TextInput
                    id="time"
                    defaultValue={device.config.time}
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
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
              <Button
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => {
                  dispatch({ type: 'SAVE_DEVICE', payload: device });
                  dispatch({ type: 'CLOSE_DEVICE' });
                }}
              >
                Apply
              </Button>
              <Button
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
                onClick={() => {
                  setDevice(deepCopyDevice(deviceIn));
                  dispatch({ type: 'CLOSE_DEVICE' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInfo;
