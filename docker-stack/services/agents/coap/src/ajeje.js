const coap = require("coap");

const avgNum = 5;
let sum = 0;
let delay = 0;
let i = 0;
let startTime = [];

function responseHandler(res) {
    console.log("Response: ", res.payload.toString());

    sum += parseInt(res.payload.toString());
    delay += Date.now() - startTime.shift();
    if (i == avgNum - 1) {
        console.log("Average val: ", sum / avgNum);
        console.log("Average delay: ", delay / avgNum);
        i = 0;
        sum = 0;
        delay = 0;
    } else
        i++;
}

// Function to send a request to the server
function sendRequest() {
    // Set endpoint to the IP address of the server and the port number
    const IP = "coap://localhost";
    const port = 5683;

    console.log("Sending request to " + IP + ":" + port);

    // Create a request to the endpoint
    let req = coap.request(new URL(IP + ":" + port));

    req.on("response", responseHandler);

    req.end();
    startTime.push(Date.now());
}

// Send the request every 5 seconds
// setInterval(sendRequest, 5000)

// Get 20 requests
for (let i = 0; i < 20; i++) {
    setTimeout(function() {
        sendRequest();
    }, 1000 * i);
}