import { Context, NextFunction } from "grammy";
import { ContextWithConfig, AccessElement, AuthorizationStatus } from "./types";
import { BotCommand } from "grammy/types";
import { Menu } from "@grammyjs/menu";

let authorizedIDs: AccessElement[] = [{
	id: 49768658,
	name: "aleben",
	date: new Date()
}];
let pendingIDs: AccessElement[] = [];

/**
 * Commands for authorization
 */
export const authCommands: BotCommand[] = [
	{
		command: "request_authorization",
		description: "Request authorization to use the bot"
	}, {
		command: "authorize",
		description: "Authorize a user or a group"
	}
];

const userMenu = new Menu<ContextWithConfig>("userMenu").dynamic((ctx, range) => {
	pendingIDs.filter((elem) => elem.id > 0).forEach((elem) => {
		if (elem.name) {
			range.text("@" + elem.name + " (" + elem.id + ")", (ctx) => {
				ctx.menu.close();
				authorizeSelected(ctx, elem)
			});
		} else {
			range.text(elem.id.toString(), (ctx) => {
				ctx.menu.close();
				authorizeSelected(ctx, elem)
			});
		}

		range.row();
	});
}).back("Go Back").text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Authorization process cancelled.");
});

const groupMenu = new Menu<ContextWithConfig>("groupMenu").dynamic((ctx, range) => {
	pendingIDs.filter((elem) => elem.id < 0).forEach((elem) => {
		if (elem.name) {
			range.text(elem.name + " (" + elem.id + ")", (ctx) => authorizeSelected(ctx, elem));
		} else {
			range.text(elem.id.toString(), (ctx) => authorizeSelected(ctx, elem));
		}

		range.row();
	});
}).back("Go Back").text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Authorization process cancel")
});;

export const authMenu = new Menu<ContextWithConfig>("authMenu").submenu("Authorize User", "userMenu").row().submenu("Authorize Group", "groupMenu").row().text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Authorization process cancel")
});;

authMenu.register(userMenu);
authMenu.register(groupMenu);

/**
 * Check if the user is authorized and save the result in the context
 * @param ctx Context
 * @param next Next function
 */
export async function checkAuthentication(ctx: ContextWithConfig, next: NextFunction) {
	console.log("Checking authentication");

	// Set the default config value
	ctx.config = {
		...ctx.config,
		authorizationStatus: AuthorizationStatus.Unknown
	};

	// If the message is undefined, something went wrong
	if (ctx.update.message === undefined && ctx.update.callback_query === undefined) {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	// Get the chat ID
	let chatID = 0
	// Chat ID can be in the message or in the callback query depending on the update type
	if (ctx.update.message) chatID = ctx.update.message.chat.id;
	else if (ctx.update.callback_query?.message) chatID = ctx.update.callback_query.message.chat.id;
	else {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	// Check if the chat is already authorized
	if (authorizedIDs.find((u) => u.id === chatID) !== undefined) {
		ctx.config = {
			authorizationStatus: AuthorizationStatus.Authorized
		};
	} else if (pendingIDs.find((u) => u.id === chatID) !== undefined) {
		ctx.config = {
			authorizationStatus: AuthorizationStatus.Pending
		};
	} else {
		ctx.config = {
			authorizationStatus: AuthorizationStatus.Unauthorized
		};
	}

	// If the grouè chat is not authorized, also check for sender authorization
	if (ctx.config.authorizationStatus != AuthorizationStatus.Authorized && (ctx.update.message?.chat.type === "group" || ctx.update.callback_query?.message?.chat.type === "group")) {
		// Get the chat ID
		let senderID = 0
		// Chat ID can be in the message or in the callback query depending on the update type
		if (ctx.update.message !== undefined) senderID = ctx.update.message.from.id;
		else if (ctx.update.callback_query?.message?.from) senderID = ctx.update.callback_query.message.from.id;
		else {
			ctx.reply("Something went wrong. Please try again.");
			return;
		}

		// Check if the chat is already authorized
		if (authorizedIDs.find((u) => u.id === senderID) !== undefined) {
			ctx.config = {
				authorizationStatus: AuthorizationStatus.Authorized
			};
		} else if (pendingIDs.find((u) => u.id === senderID) !== undefined) {
			ctx.config = {
				authorizationStatus: AuthorizationStatus.Pending
			};
		} else {
			ctx.config = {
				authorizationStatus: AuthorizationStatus.Unauthorized
			};
		}
	}

	// Call the next middleware
	await next();
}

// Handle authorization requests
export async function requestAuthorization(ctx: ContextWithConfig) {
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
	if (ctx.config.authorizationStatus === AuthorizationStatus.Authorized) {
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
	if (ctx.config.authorizationStatus !== AuthorizationStatus.Pending) {
		// Add the chat to the pending authorization list
		let elem: AccessElement = {
			id: chatID,
			name: chat.type === "private"
				? chat.username
				: chat.title,
			date: new Date()
		};

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
}

async function authorizeSelected(ctx: ContextWithConfig, element: AccessElement) {
	console.log("Authorizing " + JSON.stringify(element));

	// Remove the element from the pending list
	pendingIDs = pendingIDs.filter((elem) => elem.id !== element.id);

	// Add the element to the authorized list
	authorizedIDs.push({ ...element, date: new Date() });

	switch (ctx.message?.chat.type || ctx.update.callback_query?.message?.chat.type) {
		case "private":
			ctx.api.sendMessage(element.id, "You have been authorized to use this bot.");
			break;
		case "group":
			ctx.api.sendMessage(element.id, "This group has been authorized to use this bot.");
			break;
		default:
			console.log("Something went wrong");
			ctx.api.sendMessage(element.id, "You have been authorized to use this bot.");
	}

	ctx.editMessageText("You have succesfully authorized " + element.id + ".");
}

export async function authorize(ctx: ContextWithConfig) {
	console.log("Authorization grant received");

	// If the message is undefined, something went wrong
	if (ctx.update.message === undefined) {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	if (ctx.config.authorizationStatus !== AuthorizationStatus.Authorized) {
		ctx.reply("You are not authorized to use this command.");
		return;
	}

	ctx.reply("Plesae select the user or group you want to authorize.", { reply_markup: authMenu });
}
