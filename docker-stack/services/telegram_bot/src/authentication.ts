import {NextFunction} from "grammy";
import { ContextWithConfig, AccessElement, AuthorizationStatus } from "./types";
import { BotCommand } from "grammy/types";

let authorizedIDs: AccessElement[] = [];
let pendingIDs: AccessElement[] = [];

export const AuthCommands: BotCommand[] = [
	{
		command: "request_authorization",
		description: "Request authorization to use the bot"
	}
]

export async function checkAuthentication(ctx : ContextWithConfig, next : NextFunction) {
	console.log("Checking authentication");

	ctx.config = {
		authorizationStatus: AuthorizationStatus.Unknown
	};

	// If the message is undefined, something went wrong
	if (ctx.update.message === undefined) {
		ctx.reply("Something went wrong. Please try again.");
		return;
	}

	// Get the chat ID
	let chatID = ctx.update.message.chat.id;

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

	// Call the next middleware
	await next();
}

// Handle authorization requests
export async function requestAuthorization(ctx : ContextWithConfig) {
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
