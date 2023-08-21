import { Context, NextFunction } from "grammy";
import { ContextWithConfig, AccessElement, AuthorizationStatus } from "./types";
import { BotCommand } from "grammy/types";
import { Menu } from "@grammyjs/menu";

//TODO: Add authorization persistence
//TODO: Implement menu obsolescence
let authorizedIDs: AccessElement[] = [];
let pendingIDs: AccessElement[] = [];

// Master chat ID is the owner of the bot, this ID will always be authorized
let masterID: number | undefined = undefined;
export function setMasterID(id: number) {
	console.log("Setting root ID to " + id)
	masterID = id;
}

/**
 * Commands for authorization
 */
export const authCommands: BotCommand[] = [
	{
		command: "request_authorization",
		description: "Request authorization to use the bot"
	}, {
		command: "manage_authorizations",
		description: "Grant, list, or revoke authorization to a user or a group"
	}
];


// ---- MENU DESIGN ----

/**
 * Main menu
 */
export const authMenu = new Menu<ContextWithConfig>("authMenu", {onMenuOutdated: (ctx) => {
	ctx.editMessageText("Authorization process time out. Please open a new menu with /manage_authorizations");
	ctx.menu.close();
}})
	.submenu("List Authorizations", "listMenu").row()
	.submenu("Grant Authorization", "grantMenu").row()
	.submenu("Revoke Authorization", "revokeMenu").row()
	.text("Cancel", (ctx) => {
		ctx.menu.close();
		ctx.editMessageText("Authorization process cancel")
	});

/**
 * List auth menu
 */
const listMenu = new Menu<ContextWithConfig>("listMenu")
	.text("List users", (ctx) => {
		let message = "Authorized users:\n";
		authorizedIDs
			.filter((elem) => elem.id > 0)
			.sort((a, b) => a.date.getTime() - b.date.getTime())
			.forEach((elem) => {
				message += `${elem.id} (${elem.name}) - ${elem.date.getFullYear()}/${elem.date.getMonth()}/${elem.date.getDate()}\n`;
			});

		ctx.reply(message);
	}).row()
	.text("List groups", (ctx) => {
		let message = "Authorized groups:\n";
		authorizedIDs
			.filter((elem) => elem.id < 0)
			.sort((a, b) => a.date.getTime() - b.date.getTime())
			.forEach((elem) => {
				message += `${elem.id} (${elem.name}) - ${elem.date.getFullYear()}/${elem.date.getMonth()}/${elem.date.getDate()}\n`;
			});
		ctx.reply(message);
	}).row()
	.back("Go Back").text("Cancel", (ctx) => {
		ctx.menu.close();
		ctx.editMessageText("Authorization process cancel")
	});
authMenu.register(listMenu);

/**
 * Auth grant menu
 */
const grantMenu = new Menu<ContextWithConfig>("grantMenu")
	.submenu("Authorize User", "grantUserMenu").row()
	.submenu("Authorize Group", "grantGroupMenu").row()
	.back("Go Back")
	.text("Cancel", (ctx) => {
		ctx.menu.close();
		ctx.editMessageText("Authorization process cancel")
	});;
authMenu.register(grantMenu);

const grantUserMenu = new Menu<ContextWithConfig>("grantUserMenu").dynamic((ctx, range) => {
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
grantMenu.register(grantUserMenu);

const grantGroupMenu = new Menu<ContextWithConfig>("grantGroupMenu").dynamic((ctx, range) => {
	pendingIDs.filter((elem) => elem.id < 0).forEach((elem) => {
		if (elem.name) {
			range.text(elem.name + " (" + elem.id + ")", (ctx) => {
				ctx.menu.close();
				authorizeSelected(ctx, elem)
			});
		} else {
			range.text(elem.id.toString(), (ctx) => {
				ctx.menu.close();
				authorizeSelected(ctx, elem);
			});
		}

		range.row();
	});
}).back("Go Back").text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Authorization process cancel")
});
grantMenu.register(grantGroupMenu);

/**
 * Auth revoke menu
 */
const revokeMenu = new Menu<ContextWithConfig>("revokeMenu")
	.submenu("Revoke User", "revokeUserMenu").row()
	.submenu("Revoke Group", "revokeGroupMenu").row()
	.back("Go Back")
	.text("Cancel", (ctx) => {
		ctx.menu.close();
		ctx.editMessageText("Authorization process cancel")
	});;
authMenu.register(revokeMenu);

const revokeUserMenu = new Menu<ContextWithConfig>("revokeUserMenu").dynamic((ctx, range) => {
	authorizedIDs.filter((elem) => elem.id > 0).forEach((elem) => {
		if (elem.name) {
			range.text("@" + elem.name + " (" + elem.id + ")", (ctx) => {
				ctx.menu.close();
				revokeSelected(ctx, elem)
			});
		} else {
			range.text(elem.id.toString(), (ctx) => {
				ctx.menu.close();
				revokeSelected(ctx, elem)
			});
		}

		range.row();
	});
}).back("Go Back").text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Authorization process cancelled.");
});
revokeMenu.register(revokeUserMenu);

const revokeGroupMenu = new Menu<ContextWithConfig>("revokeGroupMenu").dynamic((ctx, range) => {
	authorizedIDs.filter((elem) => elem.id < 0).forEach((elem) => {
		if (elem.name) {
			range.text(elem.name + " (" + elem.id + ")", (ctx) => {
				ctx.menu.close();
				revokeSelected(ctx, elem)
			});
		} else {
			range.text(elem.id.toString(), (ctx) => {
				ctx.menu.close();
				revokeSelected(ctx, elem);
			});
		}

		range.row();
	});
}).back("Go Back").text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Authorization process cancel")
});
revokeMenu.register(revokeGroupMenu);

// ---- END OF MENU DESIGN ----

/**
 * Check if the user is authorized and save the result in the context. This is a middleware.
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

	// Check master user authorization
	if (masterID !== undefined && masterID === chatID) {
		ctx.config = {
			authorizationStatus: AuthorizationStatus.Authorized
		};
	}

	// If the grouè chat is not authorized, also check for sender authorization //TODO: Check if this is needed
	// if (ctx.config.authorizationStatus != AuthorizationStatus.Authorized && (ctx.update.message?.chat.type === "group" || ctx.update.callback_query?.message?.chat.type === "group")) {
	// 	// Get the chat ID
	// 	let senderID = 0
	// 	// Chat ID can be in the message or in the callback query depending on the update type
	// 	if (ctx.update.message !== undefined) senderID = ctx.update.message.from.id;
	// 	else if (ctx.update.callback_query?.message?.from) senderID = ctx.update.callback_query.message.from.id;
	// 	else {
	// 		ctx.reply("Something went wrong. Please try again.");
	// 		return;
	// 	}

	// 	// Check if the chat is already authorized
	// 	if (authorizedIDs.find((u) => u.id === senderID) !== undefined) {
	// 		ctx.config = {
	// 			authorizationStatus: AuthorizationStatus.Authorized
	// 		};
	// 	} else if (pendingIDs.find((u) => u.id === senderID) !== undefined) {
	// 		ctx.config = {
	// 			authorizationStatus: AuthorizationStatus.Pending
	// 		};
	// 	} else {
	// 		ctx.config = {
	// 			authorizationStatus: AuthorizationStatus.Unauthorized
	// 		};
	// 	}
	// }

	// Call the next middleware
	await next();
}

/**
 * Handle authorization requests. Save user data to the pending auth list
 * @param ctx Context with config
 */
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

/**
 * Move selected element from pending to authorized list and notify the chat
 * @param ctx 
 * @param element 
 */
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

/**
 * Remove selected element from authorized list and notify the chat
 * @param ctx 
 * @param element 
 */
async function revokeSelected(ctx: ContextWithConfig, element: AccessElement) {
	console.log("Revoking " + JSON.stringify(element));

	// Remove the element from the authorized list
	authorizedIDs = authorizedIDs.filter((elem) => elem.id !== element.id);

	switch (ctx.message?.chat.type || ctx.update.callback_query?.message?.chat.type) {
		case "private":
			ctx.api.sendMessage(element.id, "Your authorization to use this bot has been revoked.");
			break;
		case "group":
			ctx.api.sendMessage(element.id, "This group authorization to use this bot has been revoked.");
			break;
		default:
			console.log("Something went wrong");
			ctx.api.sendMessage(element.id, "Your authorization to use this bot has been revoked");
	}

	ctx.editMessageText("You have successfully revoked authorization to " + element.id + ".");
}

/**
 * Stating point for authorization management command
 * @param ctx 
 * @returns 
 */
export async function manageAuthorizations(ctx: ContextWithConfig) {
	console.log("Authorization management request received");

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
