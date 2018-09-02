var sensorLib = require('node-dht-sensor');
var onoff = require('onoff');

var Gpio = onoff.Gpio,
  led = new Gpio(4, 'out') //#B


sensorLib.initialize(22, 12); //#A
var interval = setInterval(function () { //#B
	
  var hum = read();
  if(hum > 50) {
    led.write(1, function() { //#E
    console.log("Changed LED state to on ");
  });
  }else{
    led.write(0, function() { //#E
    console.log("Changed LED state to off");
  });
}
}, 2000);

function read() {
  var readout = sensorLib.read(); //#C
  console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + //#D
    'humidity: ' + readout.humidity.toFixed(2) + '%');
  return readout.humidity.toFixed(2);
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
