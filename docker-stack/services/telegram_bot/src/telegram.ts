import {Api, Bot, RawApi} from "grammy";
import {AuthorizationStatus, ContextWithConfig, DeviceConfigDict} from "./telegramModules/types";
import {
	authCommands,
	authMenu,
	manageAuthorizations,
	checkAuthentication,
	setMasterID
} from "./telegramModules/authentication";
import {BotCommand} from "grammy/types";
import { devicesCommands, devicesMenu, manageDevices, setDeviceConfigDict } from "./telegramModules/devices";

export interface TelegramConfig {
	authToken: string;
	masterChatID: number;
}

const baseCommands: BotCommand[] = [
	{
		command: "start",
		description: "Start the bot"
	}, {
		command: "get_info",
		description: "Get info on the current chat"
	}
];

let finalCommands: BotCommand[] = baseCommands;

// Create an instance of the `Bot` class and pass your bot token to it.
let bot: Bot<ContextWithConfig, Api<RawApi>>;

/**
 * Initialize the Telegram bot
 * @param config Configuration object
 */
export function telegramInitializeBot(config : TelegramConfig, deviceConfigDict: DeviceConfigDict) {
	bot = new Bot<ContextWithConfig>(config.authToken);

	// Middleware definition
	bot.use(checkAuthentication);

	// Handle the /start command.
	bot.command("start", (ctx) => {
		// If the message is undefined, something went wrong
		if (ctx.update.message === undefined) {
			ctx.reply("Something went wrong. Please try again.");
			return;
		}

		// Reply with a custom message based on auth status
		switch (ctx.config.authorizationStatus) {
			case AuthorizationStatus.Authorized:
				ctx.reply("Welcome to Green Ferret Bot. You are already authorized.");
				break;
			case AuthorizationStatus.Pending:
				ctx.reply("Welcome to Green Ferret Bot. Your authorization request is pending. You will be notified when you are authorized.");
				break;
			case AuthorizationStatus.Unauthorized:
				ctx.reply("Welcome to Green Ferret Bot. To request authorization please use the /request_authorization command.");
				break;
			default:
				console.log("Something went wrong");
				ctx.reply("Welcome to Green Ferret Bot. To request authorization please use the /request_authorization command.");
		}
	});

	bot.command("get_info", (ctx) => {
		// If the message is undefined, something went wrong
		if (ctx.update.message === undefined) {
			ctx.reply("Something went wrong. Please try again.");
			return;
		}

		// Get the chat ID
		let message = ctx.update.message;

		if (message.chat.type === "private") {
			ctx.reply(`Your ID is ${message.chat.id}`);
		} else {
			ctx.reply(`This chat ID is ${message.chat.id}`);
		}
	});

	// ---- AUTHENTICATION ----
	// Set the master chat ID
	if (config.masterChatID !== 0) 
		setMasterID(config.masterChatID);

	bot.use(authMenu);

	finalCommands = baseCommands.concat(authCommands);
	bot.api.setMyCommands(finalCommands);

	// Handle authorization requests
	bot.command("authorizations", manageAuthorizations);

	// ---- DEVICES ----
	bot.use(devicesMenu);

	setDeviceConfigDict(deviceConfigDict);

	finalCommands = finalCommands.concat(devicesCommands);
	bot.api.setMyCommands(finalCommands);
	
	bot.command("devices", manageDevices);
}

export function telegramStartBot() {
	// Start the bot!
	console.log("Starting bot...");
	bot.start();
	console.log("Bot started!");
}

export function telegramStopBot() {
	console.log("Stopping bot...");
	bot.stop();
}
