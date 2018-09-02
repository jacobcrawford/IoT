var sensorLib = require('node-dht-sensor');
var onoff = require('onoff');

// The LED
var Gpio = onoff.Gpio,
  led = new Gpio(4, 'out') //#B

// The humidity and temperature sensor
sensorLib.initialize(22, 12);


// Read the humidity and temperature from the sensor.
function read() {
  var readout = sensorLib.read(); //#C
  console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + //#D
    'humidity: ' + readout.humidity.toFixed(2) + '%');
  return {hum: readout.humidity.toFixed(2), temp: readout.temperature.toFixed(2)}
};

process.on('SIGINT', function () {
  clearInterval(interval);
  led.writeSync(0); //#G
  led.unexport();
  console.log('Bye, bye!');
  process.exit();
});

//#A 22 is for DHT22/AM2302, 12 is the GPIO we connect to on the Pi
//#B create an interval to read the values every 2 seconds
//#C read the sensor values
//#D readout contains two values: temperature and humidity


// Start the server to handle the requests

var http = require("http");
http
  .createServer(function(req, res) {
	switch(req.method) {
	case 'GET':
    		res.writeHeader(200, { "Content-Type": "application/json" });
    		data = read();
		res.end(JSON.stringify({
			"led":  led.readSync(),
			"hum":  data.hum,
			"temp": data.temp
		});
		break;
  	case 'POST':
		res.writeHeader(400, {"Content-Type": "plain/text"});
		res.end("Unsupported");
  		break;
	}
  }).listen(8585);

console.log("Server started");
