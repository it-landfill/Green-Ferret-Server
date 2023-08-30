import mqtt from "mqtt";
import {InfluxWriter} from "./InfluxWriter";
import {
	DeviceConfigAttributes,
	dbConnect,
	dbDeleteConfig,
	dbDisconnect,
	dbGetAllDelete,
	dbGetAllEdited,
	dbGetConfig,
	dbInitialize,
	dbSaveConfig,
	isDeviceConfigAttributes
} from "./Postgres";

/**
 * MQTT Agent
 * This agent subscribes to the MQTT broker and forwards the messages to InfluxDB
 *
 * Environment variables:
 * - MQTT_HOST: MQTT broker host (default: localhost)
 * - MQTT_PORT: MQTT broker port (default: 1883)
 * - MQTT_USERNAME: MQTT broker username (default: '')
 * - MQTT_PASSWORD: MQTT broker password (default: '')
 * - MQTT_CLIENT_ID: MQTT client ID (default: MQTTAgent)
 * - INFLUXDB_TOKEN: InfluxDB token
 */

type MQTTConfig = {
	host: string;
	port: string;
	username: string;
	password: string;
	clientId: string;
};

// MQTT client
let client: mqtt.MqttClient;

// Refresh edited configs every 5 minutes
const refreshEditedTimeout = 5 * 60 * 1000; // 5 minutes
// Stop refreshing edited configs when the process is interrupted
let stopRefresh: boolean = false;

/**
 * Generate MQTTConfig from environment variables
 * @returns MQTTConfig object with values from environment variables
 */
function generateConfig(): MQTTConfig {
	const host = process.env.MQTT_HOST || "localhost";
	const port = process.env.MQTT_PORT || "1883";
	const username = process.env.MQTT_USERNAME || "";
	const password = process.env.MQTT_PASSWORD || "";
	const clientId = process.env.MQTT_CLIENT_ID || "MQTTAgent";

	if (!process.env.MQTT_HOST) 
		console.warn("MQTT_HOST not set, using default value (localhost)");
	if (!process.env.MQTT_PORT) 
		console.warn("MQTT_PORT not set, using default value (1883)");
	if (!process.env.MQTT_USERNAME) 
		console.warn("MQTT_USERNAME not set, using default value ('')");
	if (!process.env.MQTT_PASSWORD) 
		console.warn("MQTT_PASSWORD not set, using default value ('')");
	if (!process.env.MQTT_CLIENT_ID) 
		console.warn("MQTT_CLIENT_ID not set, using default value (MQTTAgent)");
	
	return {host, port, username, password, clientId};
}

/**
 * Initialize MQTT client
 * @param config MQTTConfig object
 * @returns MQTT client
 */
function initializeClient(config : MQTTConfig): mqtt.MqttClient {
	const address = `mqtt://${config.host}:${config.port}`;
	const options: mqtt.IClientOptions = {
		clientId: config.clientId,
		username: config.username,
		password: config.password
	};
	return mqtt.connect(address, options);
}

/**
 * Subscribe to topics
 * @param client MQTT client
 * @param topics Array of topics to subscribe to
 */
function subscribeToTopics(client : mqtt.MqttClient, topics : string[]) {
	topics.forEach((topic) => {
		client.subscribe(topic, function (err) {
			if (err) {
				console.error(`Error subscribing to topic ${topic}`);
			} else {
				console.log(`Subscribed to topic ${topic}`);
			}
		});
	});
}

/**
 * Handle incoming messages
 * @param topic Topic the message was received on
 * @param message Message payload
 */
async function messageHandler(topic : string, message : Buffer) {
	// message is Buffer
	const msg = message.toString();
	console.debug(`Received message on topic ${topic}: ${msg}`);
	const split = topic.split("/");

	if (split.length > 0) {
		// Check if this is a config message
		if (split[0] == "CFG") {
			// Config messages always have the format CFG/<sensorId>/<request>
			if (split.length != 3) {
				console.error(`Invalid topic ${topic}`);
				return;
			}

			const sensorId = split[1];
			const request = split[2];

			switch (request) {
				case "new":
					// This is a new config request, send the current config or generate a new one

					// Get the current config from the database, if there is one.
					// Special case: if the config is flag for deletion, generate a new one
					let cfg = await dbGetConfig(sensorId);
					// If there is no config, generate a new one with default values
					if (cfg === undefined) {
						cfg = {
							protocol: 1, // MQTT
							trigger: 1, // Time
							distanceMethod: 0,
							distance: 0,
							time: 30 // 30 seconds
						};
					}

					// Publish the config to the device
					client.publish(`CFG/${sensorId}/Config`, JSON.stringify(cfg), {retain: true});
					break;
				case "Config":
					// This is a config, we need to save this
					console.log("Received config: " + msg);
					try {
						// Convert the message to an object
						const parsed = JSON.parse(msg);
						// Check if the object is a DeviceConfigAttributes object
						if (isDeviceConfigAttributes(parsed)) {
							// If it is, save it to the database
							await dbSaveConfig(sensorId, parsed);
						} else {
							// If it isn't, log an error
							console.error("Invalid config received");
						}
					} catch (e) {
						console.error("Invalid config received");
					}
					break;
			}
		} else {
			// This is a sensor message. Sensor messages always have the format <root>/<sensorId>, where root is the category of the sensor (usually
			// mobile-sensors)
			if (split.length != 2) {
				console.error(`Invalid topic ${topic}`);
				return;
			}

			const root = split[0];
			const sensorId = split[1];

			// Write the data to InfluxDB
			InfluxWriter.writeData(InfluxWriter.parseBody(msg), {
				source: "mqtt-agent",
				sensorId: sensorId
			}, root);
		}
	}
}

/**
 * Refresh edited configs periodically
 */
async function refreshEdited() {
	// if stopRefresh is true, stop refreshing
	if (stopRefresh) 
		return;
	
	// ---- Refresh edited configs ---- Get all edited configs from the database (edited configs are configs that have been changed by the admin, see
	// Green-Ferret-Admin) only if the refresh is not stopped
	const edited = await dbGetAllEdited();
	if (edited) {
		// If there are edited configs, publish them to the devices
		console.log("Refreshing edited configs");
		edited.forEach((cfg) => {
			client.publish(`CFG/${cfg.deviceID}/Config`, JSON.stringify({
				...cfg.dataValues,
				deviceID: undefined
			}), {retain: true});
		});
	}

	// ---- Delete deleted configs ----
	const deleted = await dbGetAllDelete();
	if (deleted) {
		// If there are deleted configs, publish them to the devices
		console.log("Deleting deleted configs");
		deleted.forEach((cfg) => {
			client.publish(`CFG/${cfg.deviceID}/Config`, "", {retain: true});
			dbDeleteConfig(cfg.deviceID);
		});
	}

	// Refresh again after the timeout has passed
	if (!stopRefresh) 
		setTimeout(refreshEdited, refreshEditedTimeout);
	}

/**
 * Main function
 */
async function main() {
	// Initialize InfluxDB writer
	if (!process.env.INFLUXDB_TOKEN) {
		console.error("INFLUXDB_TOKEN not set");
		process.exit(1);
	}

	// Initialize InfluxDB writer
	InfluxWriter.initializeClient(process.env.INFLUXDB_TOKEN);

	// Initialize postgres
	dbInitialize();
	await dbConnect();

	// Initialize MQTT client and config
	const config = generateConfig();
	client = initializeClient(config);

	// Subscribe to topics when the client connects
	client.on("connect", function () {
		console.log("Connected to MQTT broker");
		subscribeToTopics(client, ["mobile-sensors/#", "CFG/#"]);
	});

	// Handle incoming messages
	client.on("message", messageHandler);

	// Refresh edited configs
	if (!stopRefresh) 
		refreshEdited();
	
	// Handle interrupt signal
	process.on("SIGINT", async function () {
		console.log("Caught interrupt signal");
		stopRefresh = true;
		console.log("Closing mqtt client");
		client.end();
		console.log("Disconnecting from database");
		await dbDisconnect();
		console.log("Exiting");
		process.exit();
	});
}

main();
