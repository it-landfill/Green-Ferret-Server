import {Bot} from "grammy";
import {Menu, MenuRange} from "@grammyjs/menu";

interface AccessElement {
	id: Number;
	name: string | undefined;
}

let authorizedIDs: AccessElement[] = [];
let pendingIDs: AccessElement[] = [];

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot("6345939871:AAG2Tkzv9NDHKMAJebAlunBjhJIwkf-69r8"); // <-- put your bot token between the ""

bot.api.setMyCommands([
	{
		command: "start",
		description: "Start the bot"
	}, {
		command: "authorize",
		description: "Authorize a user or a group"
	}, {
		command: "request_authorization",
		description: "Request authorization to use the bot"
	}
]);

// Handle the /start command.
bot.command("start", (ctx) => {
	
	// If the message is undefined, something went wrong
	if (ctx.update.message === undefined) {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	// Get the chat ID
	let chatID = ctx.update.message.chat.id;

	// Check if the chat is already authorized
	if (authorizedIDs.find((u) => u.id === chatID) !== undefined) {
		ctx.reply("Welcome to Green Ferret Bot. You are already authorized.");
		return;
	}

	// Check if the chat is already pending authorization
	if (pendingIDs.find((u) => u.id === chatID) !== undefined) {
		ctx.reply("Welcome to Green Ferret Bot. Your authorization request is pending. You will be notified when you are authorized.");
		return;
	}

	// At this point the chat is not authorized and not pending authorization
	ctx.reply("Welcome to Green Ferret Bot. To request authorization please use the /request_authorization command.");
});

// Handle authorization requests
bot.command("request_authorization", (ctx) => {
	console.log("Authorization request received");

	// If the message is undefined, something went wrong
	if (ctx.update.message === undefined) {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	// Get the chat element
	let chat = ctx.update.message.chat;

	// Check if the chat type is supported
	if (chat.type !== "private" && chat.type !== "group") {
		ctx.reply("The chat format you are currently using is not supported. This bot supports only private chats and groups.");
		return;
	}

	// Get the chat ID
	let chatID = chat.id;

	// Check if the chat is already authorized
	if (authorizedIDs.find((u) => u.id === chatID) !== undefined) {
		switch (chat.type) {
			case "private":
				ctx.reply("You are already authorized.");
				break;
			case "group":
				ctx.reply("This group is already authorized.");
				break;
			default:
				ctx.reply("Already authorized.");
		}
		return;
	}

	// Check if the chat is already pending authorization
	if (pendingIDs.find((u) => u.id === chatID) === undefined) {
		// Add the chat to the pending authorization list
		let elem: AccessElement = {
			id: chatID,
			name: chat.type === "private"
				? chat.username
				: chat.title
		}
			
		pendingIDs.push(elem);
		console.log("Adding to pending authorization list " + JSON.stringify(elem));

		switch (chat.type) {
			case "private":
				ctx.reply("Your authorization request has been saved. You will be notified when you are authorized.");
				break;
			case "group":
				ctx.reply("This group authorization request has been saved. You will be notified when you are authorized.");
				break;
			default:
				console.log("Something went wrong");
				ctx.reply("Your authorization request has been saved. You will be notified when you are authorized.");
		}
	} else {
		// The chat is already pending authorization
		switch (chat.type) {
			case "private":
				ctx.reply("You already requested personal access. Please be patient, You will be notified when you are authorized.");
				break;
			case "group":
				ctx.reply("This group already requested access. Please be patient, You will be notified when you are authorized.");
				break;
			default:
				console.log("Something went wrong");
				ctx.reply("You already requested personal access. Please be patient, You will be notified when you are authorized.");
		}
	}
});

// let menu = new Menu("dynamic"); bot.use(menu); menu.dynamic(() => { 	const range = new MenuRange(); 	authorizedUserIDs.forEach((i) => {
// range.text(i.toString(), (ctx) => ctx.reply(`You chose ${i}`)).row(); 	}); 	console.log(range); 	return range; }); bot.command("authorize", (ctx)
// => { 	console.log("Authorize command received"); 	ctx.reply("Do you want to authorize an user or a group?", {reply_markup: menu}); }); Now that you
// specified how to handle messages, you can start your bot. This will connect to the Telegram servers and wait for messages. Start the bot.
console.log("Starting bot...");
bot.start();
