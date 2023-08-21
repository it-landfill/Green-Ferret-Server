import {BotCommand} from "grammy/types";
import {AuthorizationStatus, ContextWithConfig, DeviceConfigDict} from "./types";
import {Menu} from "@grammyjs/menu";

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

let deviceConfigDict: DeviceConfigDict;

export const devicesMenu = new Menu<ContextWithConfig>("devicesMenu", {
	onMenuOutdated: (ctx) => {
		ctx.editMessageText("Devices management process time out. Please open a new menu with /devices");
		ctx.menu.close();
	}
}).dynamic((ctx, range) => {
	for (const [key, value] of Object.entries(deviceConfigDict)) {
		range.text(key, () => {
			let baseStr = `_Device selected:_\n*${key}*\n\n_Current config:_\nprotocol:*${value.protocol}*\ntrigger:*${value.trigger}*`;
			switch (value.trigger) {
				case 0:
					baseStr += `\ndistance method:*${value.distanceMethod}*\ndistance:*${value.distance}*`;
					break;
				case 1:
					baseStr += `\ntime:*${value.time}*`;
					break;
			}
			ctx.editMessageText(baseStr, {parse_mode: "MarkdownV2"});
		}).row();
	}
}).text("Cancel", (ctx) => {
	ctx.menu.close();
	ctx.editMessageText("Device management process cancel");
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

export function setDeviceConfigDict(deviceConfigDict_ : DeviceConfigDict) {
	deviceConfigDict = deviceConfigDict_;
}
