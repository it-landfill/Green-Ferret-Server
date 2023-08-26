'use client';

import { StateModel, StateReducer } from '@/models/StateModel';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import { Button, Modal } from 'flowbite-react';

import React, { useEffect } from 'react';
import { generateNewDevice } from '@/models/DeviceModel';
import DeviceInfo from './components/DeviceInfo';
import { mqttInitializeClient, mqttSetMessageHandler, mqttSubscribe } from '@/models/mqtt';

const initialState: StateModel = {
  searchText: '',
  devices: [
  ],
  showDevice: "",
};

export default function Home() {
  const [state, dispatch] = React.useReducer(StateReducer, initialState);

  /**
	 * Handle incoming MQTT messages
	 * @param topic Topic the message was received on
	 * @param message Message payload
	 */
	mqttSetMessageHandler((topic : string, message : Buffer) => {
		// message is Buffer
		const msg = message.toString();
		console.debug(`Received message on topic ${topic}: ${msg}`);
		const split = topic.split("/");
		if (split.length != 3) {
			console.error(`Invalid topic ${topic}`);
			return;
		}
+
		const root = split[0];
		const sensorId = split[1];
		const property = split[2];
		console.debug(`Root: ${root}, sensor ID: ${sensorId}, property: ${property}, message: ${msg}`);

		if (root == "CFG") {
			// Device is requesting configuration
			if (property === "new") {
				// Try to find the device in the state
				let dev = state.devices.find(d => d.id === sensorId);
				// If not found, create a new device
				if (dev === undefined) dev = generateNewDevice(sensorId);
				// Send the device configuration to the device
				dispatch({
					type: "SAVE_DEVICE",
					payload: dev
				});
			}
		}
	});

	useEffect(() => {
		mqttInitializeClient();
		mqttSubscribe(["CFG/#"]);
	  });

  return (
    <div>
      <SearchBar state={state} dispatch={dispatch} />
      <SearchResults state={state} dispatch={dispatch} />
    </div>
  );
}
