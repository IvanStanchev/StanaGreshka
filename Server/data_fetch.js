const { Data } = "dataclass";
const { ReadlineParser } = require("serialport");

var dataClass = require("dataclass").Data;

class Sensor extends dataClass {
  temperature;
  pressure;
  humidity;
  gas;
}

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort({ path: "COM8", baudRate: 115200 });

const parser = new ReadlineParser();

serialPort.pipe(parser);
// //parser.on("data", console.log);
let json = "";
let counter = 0;
parser.on("data", function (data) {
  json += data;
  console.log("JSON \n" + json);
  counter++;
  if (counter === 5) {
    ("use strict");
    let jsonStr = Sensor.create(data);
    console.log(jsonStr);
  }
});
