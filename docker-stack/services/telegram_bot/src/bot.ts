import {Bot} from "grammy";
import {Menu, MenuRange} from "@grammyjs/menu";

import {AuthorizationStatus, Config, ContextWithConfig} from "./types";
import {authCommands, authMenu, authorize, checkAuthentication, requestAuthorization} from "./authentication";
import { BotCommand } from "grammy/types";

const config: Config = {
	authToken: "6345939871:AAG2Tkzv9NDHKMAJebAlunBjhJIwkf-69r8"
}

const baseCommands: BotCommand[] = [
	{
		command: "start",
		description: "Start the bot"
	},
	{
		command: "get_info",
		description: "Get info on the current chat"
	}
]

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot<ContextWithConfig>(config.authToken);
bot.use(checkAuthentication);
bot.use(authMenu);

bot.api.setMyCommands(baseCommands.concat(authCommands));

// Handle the /start command.
bot.command("start", (ctx) => {
	// If the message is undefined, something went wrong
	if (ctx.update.message === undefined) {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	// Get the chat ID
	let chatID = ctx.update.message.chat.id;

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
})

// Handle authorization requests
bot.command("request_authorization", requestAuthorization);
bot.command("authorize", authorize);

// let menu = new Menu("dynamic"); bot.use(menu); menu.dynamic(() => { 	const range = new MenuRange(); 	authorizedUserIDs.forEach((i) => {
// range.text(i.toString(), (ctx) => ctx.reply(`You chose ${i}`)).row(); 	}); 	console.log(range); 	return range; }); bot.command("authorize", (ctx)
// => { 	console.log("Authorize command received"); 	ctx.reply("Do you want to authorize an user or a group?", {reply_markup: menu}); }); Now that you
// specified how to handle messages, you can start your bot. This will connect to the Telegram servers and wait for messages. Start the bot.
console.log("Starting bot...");
bot.start();
