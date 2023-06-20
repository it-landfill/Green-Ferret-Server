const coap = require("coap");

function responseHandler(res) {
    console.log("Response: ", res.payload);
}

// Function to send a request to the server
function sendRequest() {
    // Set endpoint to the IP address of the server and the port number
    const IP = "coap://localhost/telemetry/mobile-sensors/ajejej";
    const port = 5683;

    console.log("Sending request to " + IP + ":" + port);

    const data = {
        tem: 20.2,
        hum: 50.1
    };

    // Create a request to the endpoint
    // let req = coap.request(new URL(IP + ":" + port));
    let req = coap.request(IP);

    req.write(JSON.stringify(data));

    req.on("response", responseHandler);

    req.end();
}

sendRequest();