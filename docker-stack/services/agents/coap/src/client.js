const coap = require("coap");

function responseHandler(res) {
    console.log("Response: ", res.payload);
}

// Function to send a request to the server
function sendRequest() {
    // Set endpoint to the IP address of the server and the port number
    const IP = "coap://localhost";
    const port = 5683;

    console.log("Sending request to " + IP + ":" + port);

    const data = {
        temp: 20,
        hum: 50
    };

    // Create a request to the endpoint
    let req = coap.request(new URL(IP + ":" + port));

    req.write(JSON.stringify(data));

    req.on("response", responseHandler);

    req.end();
}

sendRequest();