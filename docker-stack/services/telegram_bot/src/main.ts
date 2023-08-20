import {
	MqttConfig,
	mqttClose,
	mqttInitializeClient,
	mqttPublish,
	mqttSetMessageHandler,
	mqttSubscribeToTopics
} from "./mqtt";
import {TelegramConfig, telegramInitializeBot, telegramStartBot, telegramStopBot} from "./telegram";

// ---- Common data ----
interface DeviceConfig {
	protocol: number;
	trigger: number;
	distanceMethod: number;
	distance: number;
	time: number;
}

let deviceConfigDict: {
	[key: string]: DeviceConfig
} = {};

// ---- MQTT ---- Generate MQTT config
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

const mqttConfig: MqttConfig = {
	host: process.env.MQTT_HOST || "localhost",
	port: process.env.MQTT_PORT || "1883",
	username: process.env.MQTT_USERNAME || "",
	password: process.env.MQTT_PASSWORD || "",
	clientId: process.env.MQTT_CLIENT_ID || "MQTTAgent"
};

// Initialize MQTT client
mqttInitializeClient(mqttConfig);

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

	const root = split[0];
	const sensorId = split[1];
	const property = split[2];
	console.debug(`Root: ${root}, sensor ID: ${sensorId}, property: ${property}`);

	if (root === "CFG" && property === "request") {
		// Generate new config if it doesn't exist
		if (deviceConfigDict[sensorId] === undefined) {
			console.info(`Sensor ${sensorId} not found, generating new config`);
			deviceConfigDict[sensorId] = {
				protocol: 1, // MQTT protocol
				trigger: 1, // Time trigger
				distanceMethod: 0,
				distance: 0,
				time: 20 * 1000 // Time in millis (20s)
			};
		}

		// Publish config
		mqttPublish(`CFG/${sensorId}/Config`, JSON.stringify(deviceConfigDict[sensorId]));
	}
});

// Set up MQTT subscriptions
mqttSubscribeToTopics(["CFG/#"]);

// ---- Telegram Bot ----
if (!process.env.TELEGRAM_API_TOKEN) {
	console.error("TELEGRAM_API_TOKEN not set. exiting...");
	process.exit(1);
}
if (!process.env.TELEGRAM_MASTER_CHAT_ID) 
	console.warn("TELEGRAM_MASTER_CHAT_ID not set, using default value (0)");

const telegramConfig: TelegramConfig = {
	authToken: process.env.TELEGRAM_API_TOKEN,
	masterChatID: parseInt(process.env.TELEGRAM_MASTER_CHAT_ID || "0")
};

// Initialize Telegram bot
telegramInitializeBot(telegramConfig);

// Start the bot 
telegramStartBot();

// Handle interrupt signal
process.on("SIGINT", function () {
	console.log("Caught interrupt signal");
	console.log("Closing MQTT client");
	mqttClose();
	console.log("Closing Telegram bot");
	telegramStopBot();
	process.exit();
});