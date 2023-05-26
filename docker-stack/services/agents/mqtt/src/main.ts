import mqtt from "mqtt";
import {InfluxWriter} from "./InfluxWriter";

/**
 * MQTT Agent
 * This agent subscribes to the MQTT broker and forwards the messages to the
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

function initializeClient(config : MQTTConfig): mqtt.MqttClient {
	const address = `mqtt://${config.host}:${config.port}`;
	const options: mqtt.IClientOptions = {
		clientId: config.clientId,
		username: config.username,
		password: config.password
	};
	return mqtt.connect(address, options);
}

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

function messageHandler(topic : string, message : Buffer) {
	// message is Buffer
	const msg = message.toString();
	console.debug(`Received message on topic ${topic}: ${msg}`);
	const split = topic.split("/");
	if (split.length != 2) {
		console.error(`Invalid topic ${topic}`);
		return;
	}

	const root = split[0];
	const sensorId = split[1];
	InfluxWriter.writeData(JSON.parse(msg), {
		source: "mqtt-agent",
		sensorId: sensorId
	}, root);
}

function main() {
	// Initialize InfluxDB writer
	if (!process.env.INFLUXDB_TOKEN) {
		console.error("INFLUXDB_TOKEN not set");
		process.exit(1);
	}

	InfluxWriter.initializeClient(process.env.INFLUXDB_TOKEN);

	const config = generateConfig();
	const client = initializeClient(config);

	client.on("connect", function () {
		console.log("Connected to MQTT broker");
		subscribeToTopics(client, ["mobile-sensors/#"]);
	});

	client.on("message", messageHandler);

	process.on("SIGINT", function () {
		console.log("Caught interrupt signal");
		client.end();
	});
}

main();
