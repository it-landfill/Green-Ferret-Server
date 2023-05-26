const coap = require("coap");

/**
 * CoAP Agent
 * This agent generates a CoAP server that listens for incoming requests and forwards the received data to InfluxDB.
 *
 * Environment variables:
 */

type CoAPConfig = {};

const server = coap.createServer();

server.on("request", (req : any, res : any) => {
	console.log("New request received " + JSON.stringify(req.payload));
	res.end("Hello " + req.url.split("/")[1] + "\n");
});

// the default CoAP port is 5683
server.listen(() => {
	const req = coap.request("coap://localhost");

	req.on("response", (res : any) => {
		res.pipe(process.stdout);
		res.on("end", () => {
			//process.exit(0);
		});
	});

	req.end();
});
