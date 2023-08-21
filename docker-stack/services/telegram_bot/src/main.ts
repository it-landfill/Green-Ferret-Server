import {
	MqttConfig,
	mqttClose,
	mqttInitializeClient,
	mqttPublish,
	mqttSetMessageHandler,
	mqttSubscribeToTopics
} from "./mqtt";
import {TelegramConfig, forwardLog, telegramInitializeBot, telegramStartBot, telegramStopBot} from "./telegram";

// ---- Common data ----

const enableMQTT = true;
const enableTelegram = true;

// ---- Telegram Bot ----
if (enableTelegram) {
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
}

// ---- MQTT ----
if (enableMQTT) {
	/**
	 *  Generate MQTT config
	 *  Environment variables:
	 * - MQTT_AGENT_HOST: MQTT broker host (default: localhost)
	 * - MQTT_AGENT_PORT: MQTT broker port (default: 1883)
	 * - MQTT_AGENT_USERNAME: MQTT broker username (default: '')
	 * - MQTT_AGENT_PASSWORD: MQTT broker password (default: '')
	 * - MQTT_AGENT_CLIENT_ID: MQTT client ID (default: MQTTAgent)
	 * - INFLUXDB_TOKEN: InfluxDB token
	 */
	if (!process.env.MQTT_AGENT_HOST) 
		console.warn("MQTT_AGENT_HOST not set, using default value (localhost)");
	if (!process.env.MQTT_AGENT_PORT) 
		console.warn("MQTT_AGENT_PORT not set, using default value (1883)");
	if (!process.env.MQTT_AGENT_USERNAME) 
		console.warn("MQTT_AGENT_USERNAME not set, using default value ('')");
	if (!process.env.MQTT_AGENT_PASSWORD) 
		console.warn("MQTT_AGENT_PASSWORD not set, using default value ('')");
	if (!process.env.MQTT_AGENT_CLIENT_ID) 
		console.warn("MQTT_AGENT_CLIENT_ID not set, using default value (MQTTAgent)");
	
	const mqttConfig: MqttConfig = {
		host: process.env.MQTT_AGENT_HOST || "localhost",
		port: process.env.MQTT_AGENT_PORT || "1883",
		username: process.env.MQTT_AGENT_USERNAME || "",
		password: process.env.MQTT_AGENT_PASSWORD || "",
		clientId: process.env.MQTT_AGENT_CLIENT_ID || "MQTTAgent"
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
		console.debug(`Root: ${root}, sensor ID: ${sensorId}, property: ${property}, message: ${msg}`);

		// Forward message to Telegram authorized users
		forwardLog({
			timestamp: new Date(),
			boardID: sensorId,
			level: property,
			message: msg
		});
	});

	// Set up MQTT subscriptions
	mqttSubscribeToTopics(["logging/#"]);
}

// Handle interrupt signal
process.on("SIGINT", function () {
	console.log("Caught interrupt signal");
	if (enableMQTT) {
		console.log("Closing MQTT client");
		mqttClose();
	}
	if (enableTelegram) {
		console.log("Closing Telegram bot");
		telegramStopBot();
	}
	process.exit();
});
