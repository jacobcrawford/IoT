var sensorLib = require("node-dht-sensor");
var onoff = require("onoff");

// The LED
var Gpio = onoff.Gpio,
  led = new Gpio(4, "out");

var port = 8585;
// The humidity and temperature sensor
sensorLib.initialize(22, 12);

// Read the humidity and temperature from the sensor.
function read() {
  var readout = sensorLib.read();
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
  led.writeSync(0);
  led.unexport();
  console.log("Bye, bye!");
  process.exit();
});

// Start the server to handle the requests

var http = require("http");

http
  .createServer(function(req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
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
                      var data = JSON.parse(body);
                      if (data.led === 1) {
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
    .listen(port);

console.log("Server started. Listening on port:"+  port.toString());

