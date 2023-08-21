import {connect, MqttClient, IClientOptions} from "mqtt";

/**
 * MQTT Agent
 * This agent subscribes to the MQTT broker and forwards the messages to InfluxDB
 *
 */
export interface MqttConfig {
	host: string;
	port: string;
	username: string;
	password: string;
	clientId: string;
}

// Mqtt client
let mqttClient: MqttClient;

/**
 * Initialize MQTT client
 * @param config MQTTConfig object
 * @returns the status of the initialization
 */
export function mqttInitializeClient(config : MqttConfig): boolean {
	const address = `mqtt://${config.host}:${config.port}`;
	const options: IClientOptions = {
		clientId: config.clientId,
		username: config.username,
		password: config.password
	};
	mqttClient = connect(address, options);
	return mqttClient !== undefined;
}

/**
 * Subscribe to topics
 * @param topics Array of topics to subscribe to
 */
export function mqttSubscribeToTopics(topics : string[]) {
	topics.forEach((topic) => {
		mqttClient.subscribe(topic, function (err) {
			if (err) {
				console.error(`Error subscribing to topic ${topic}. error: ${err}`);
			} else {
				console.log(`Subscribed to topic ${topic}`);
			}
		});
	});
}

/**
 * Set MQTT message handler
 * @param handler Handler function
 */
export function mqttSetMessageHandler(handler : (topic : string, message : Buffer) => void) {
	if (mqttClient === undefined) {
		console.error("MQTT client not initialized");
	}
	mqttClient.on("message", handler);
}

export function mqttPublish(topic : string, message : string, retain : boolean = false) {
	mqttClient.publish(topic, message, {retain: retain});
}

export function mqttClose() {
	mqttClient.end();
}