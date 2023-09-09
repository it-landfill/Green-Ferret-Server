const coap = require("coap");

import {InfluxWriter} from "./InfluxWriter";

/**
 * CoAP Agent
 * This agent generates a CoAP server that listens for incoming requests and forwards the received data to InfluxDB.
 * https://github.com/coapjs/node-coap/blob/master/examples/
 *
 * Environment variables:
 * - COAP_PORT: Port on which the CoAP server will listen for incoming requests.
 * - INFLUXDB_TOKEN: InfluxDB token
 */

// Get COAP_PORT from environment variables or use default value
const port = process.env.COAP_PORT || "5683";
if (!process.env.COAP_PORT) 
	console.warn("COAP_PORT not set, using default value (5683)");

// Get INFLUXDB_TOKEN from environment variables
const influx_token = process.env.INFLUXDB_TOKEN;
if (!influx_token) {
	console.error("INFLUXDB_TOKEN not set, exiting...");
	process.exit(1);
}

// Initialize CoAP server
const server = coap.createServer();

/**
 * Telemetry route
 * This route receives telemetry data from the devices and forwards it to InfluxDB
 *
 * Endpoint: /telemetry/:group/:id
 */
server.on("request", (req : any, res : any) => {
	// Based on the URL, the server can decide to send a different response.
	console.log(req.url);
	const path = req.url.split("/");

	if (path.length != 4) {
		console.warn("Received bad request. Url malformed. Expected /telemetry/:group/:id but got " + req.url);
		res.end();
		return;
	}

	const endpoint = path[1];
	const group = path[2];
	const id = path[3];

	switch (endpoint) {
		case "telemetry":
			console.debug("Received telemetry data from device " + group + "/" + id);
			const payload = req.payload.toString();
			console.debug("Payload: " + payload);
			InfluxWriter.writeData(InfluxWriter.parseBody(payload), {
				source: "coap-agent",
				sensorId: id
			}, group);
			break;
		default:
			console.warn("Received bad request. Endpoint unknown " + req.url);
			console.debug(req.payload.toString());
	}
	res.end();
});

// Initialize InfluxDB client
InfluxWriter.initializeClient(influx_token);

server.listen(port, () => {
	console.log("COAP Agent started on port " + port);
});
