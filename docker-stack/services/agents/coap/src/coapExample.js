const coap = require("coap"); // or coap

coap.createServer((req, res) => {
    res.end("Hello " + req.url.split("/")[1] + "\nMessage payload:\n" + req.payload + "\n");
}).listen(() => {
    const req = coap.request("coap://localhost/Matteo");

    const payload = {
        temp: 20,
        hum: 50
    };

    req.write(JSON.stringify(payload));

    req.on("response", res => {
        res.pipe(process.stdout);
        res.on("end", () => {
            process.exit(0);
        });
    });

    req.end();
});