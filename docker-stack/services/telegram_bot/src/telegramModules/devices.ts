import {BotCommand} from "grammy/types";
import {AuthorizationStatus, ContextWithConfig} from "./types";
import { Menu } from "@grammyjs/menu";

/**
 * Commands for devices management
 */
export const devicesCommands: BotCommand[] = [
	{
		command: "devices",
		description: "List and manage devices"
	}
];

// ---- MENU DESIGN ----

export const devicesMenu = new Menu<ContextWithConfig>("devicesMenu", {onMenuOutdated: (ctx) => {
	ctx.editMessageText("Devices management process time out. Please open a new menu with /devices");
	ctx.menu.close();
}})
.text("Ajeje", () => {
	console.log("Ajeje");
});

// ---- END OF MENU DESIGN ----

export async function manageDevices(ctx : ContextWithConfig) {
	console.log("Devices management request received");

	if (ctx.config.authorizationStatus !== AuthorizationStatus.Authorized) {
		ctx.reply("You are not authorized to manage devices.");
		return;
	}

	ctx.reply("Please select the device to manage", {reply_markup: devicesMenu});
}
