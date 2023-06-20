import express from "express";
import bodyParser from "body-parser";

import {InfluxWriter} from "./InfluxWriter";

/**
 * HTTP Agent
 * This agent receives telemetry data from the devices via HTTP requests
 *
 * Environment variables:
 * - HTTP_PORT: HTTP broker port (default: 8080)
 * - INFLUXDB_TOKEN: InfluxDB token
 */

// Get HTTP_PORT from environment variables or use default value
const port = process.env.HTTP_PORT || "8080";
if (!process.env.HTTP_PORT) {
	console.warn("HTTP_PORT not set, using default value (8080)");
}

// Get INFLUXDB_TOKEN from environment variables
const influx_token = process.env.INFLUXDB_TOKEN;
if (!influx_token) {
	console.error("INFLUXDB_TOKEN not set, exiting...");
	process.exit(1);
}

// Initialize Express app
const app = express();

// Set body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Base route
app.get("/", (req, res) => {
	res.send("I'm alive!");
});

// Pinging route
app.get("/ping", (req, res) => {
	res.send("pong");
});

/**
 * Telemetry route
 * This route receives telemetry data from the devices and forwards it to InfluxDB
 * Endpoint: /telemetry/:group/:id
 */
app.post("/telemetry/:group/:id", (req, res) => {
	const group = req.params.group;
	const id = req.params.id;

	if (!group || !id) {
		res.status(400).send("Bad request");
		console.warn("Received bad request. Url malformed. Expected /telemetry/:group/:id but got /telemetry/" + group + "/" + id);
		return;
	}

	const body = req.body;

	console.debug(`Received telemetry data from ${group}/${id}`);
	console.debug(body);

	// Write data to InfluxDB
	InfluxWriter.writeData(InfluxWriter.parseBody(body), {
		source: "http-agent",
		sensorId: id
	}, group);

	res.send("Ok");
});

// Initialize InfluxDB client
InfluxWriter.initializeClient(influx_token);

// Start Express app
app.listen(port, () => console.log(`HTTP Agent listening on port ${port}!`));
