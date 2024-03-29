import {Context} from "grammy";

export interface AccessElement {
	id: number;
	name: string | undefined;
	date: Date;
}

export enum AuthorizationStatus {
	Pending,
	Authorized,
	Unauthorized,
	Unknown
};

interface ContextConfig {
	config: {
		authorizationStatus: AuthorizationStatus;
	};
}

export type ContextWithConfig = Context & ContextConfig;

export interface LogMessage {
	timestamp: Date;
	boardID: string;
	level: string | undefined;
	message: string;
}

interface DeviceConfig {
	protocol: number;
	trigger: number;
	distanceMethod: number;
	distance: number;
	time: number;
}

export interface DeviceConfigDict {
	[key: string]: DeviceConfig;
}