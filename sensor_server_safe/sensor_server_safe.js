var sensorLib = require("node-dht-sensor");
var onoff = require("onoff");

// The LED
var Gpio = onoff.Gpio,
    led = new Gpio(4, "out"); //#B

// The humidity and temperature sensor
sensorLib.initialize(22, 12);

// Read the humidity and temperature from the sensor.
function read() {
    var readout = sensorLib.read(); //#C
    console.log(
        "Temperature: " +
        readout.temperature.toFixed(2) +
        "C, " + //#D
        "humidity: " +
        readout.humidity.toFixed(2) +
        "%"
    );
    return {
        hum: readout.humidity.toFixed(2),
        temp: readout.temperature.toFixed(2)
    };
}

process.on("SIGINT", function() {
    clearInterval(interval);
    led.writeSync(0); //#G
    led.unexport();
    console.log("Bye, bye!");
    process.exit();
});

//#A 22 is for DHT22/AM2302, 12 is the GPIO we connect to on the Pi
//#B create an interval to read the values every 2 seconds
//#C read the sensor values
//#D readout contains two values: temperature and humidity

// Start the server to handle the requests

var https = require("https");
var fs = require('fs');

const options = {
    key:    fs.readFileSync("privatekey.pem"),
    cert:   fs.readFileSync("certificate.pem"),
    passphrase: "1234"

};

https
    .createServer(options,function(req, res) {
        switch (req.method) {
            case "GET":
                res.writeHeader(200, { "Content-Type": "application/json" });
                data = read();
                res.end(
                    JSON.stringify({
                        led: led.readSync(),
                        hum: data.hum,
                        temp: data.temp
                    })
                );
                break;
            case "POST":
                res.writeHeader(200, { "Content-Type": "plain/text" });
                let body = [];
                req
                    .on("data", chunk => {
                        body.push(chunk);
                    })
                    .on("end", () => {
                        body = Buffer.concat(body).toString();
                        // at this point, `body` has the entire request body stored in it as a string
                        console.log(body)
                        var data = JSON.parse(body);
                        if (data.led == 1) {
                            led.write(1, function() {
                                res.end("LED turned on");
                            });
                        } else {
                            led.write(0, function() {
                                res.end("LED turned off");
                            });
                        }
                    });
                break;
        }
    })
    .listen(8585);

console.log("Server started");


