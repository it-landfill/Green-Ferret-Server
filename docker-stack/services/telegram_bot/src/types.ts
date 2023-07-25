import {Context} from "grammy";

export interface AccessElement {
	id: Number;
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

export interface Config {
	authToken: string;
}