const { Data } = "dataclass";
const { ReadlineParser } = require("serialport");

<<<<<<< Updated upstream
var dataClass = require("dataclass").Data;

class Sensor extends dataClass {
  temperature;
  pressure;
  humidity;
  gas;
}

=======
>>>>>>> Stashed changes
var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort({ path: "COM8", baudRate: 115200 });

const parser = new ReadlineParser();

<<<<<<< Updated upstream
String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

serialPort.pipe(parser);
// //parser.on("data", console.log);
let json = "";
let counter = 0;
parser.on("data", function (data) {
  json += data;
  console.log("JSON \n" + json);
  counter++;

  console.log("If statement");
  const jsonStr = json.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
  console.log(jsonStr);
  const jsonObj = JSON.parse(jsonStr);
  console.log(jsonObj);
  storeData(jsonObj);
  json = "";
});
=======
serialPort.pipe(parser);

function ReadFromDevice() {
  let json = "";
  let counter = 0;
  parser.on("data", function (data) {
    json += data;
    console.log("JSON \n" + json);
    counter++;

    console.log("If statement");
    const jsonStr = json.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
    console.log(jsonStr);
    const jsonObj = JSON.parse(jsonStr);
    console.log(jsonObj);

    storeData(jsonObj);
    json = "";
    return jsonObj;
  });
}
>>>>>>> Stashed changes

let dataArray = [];
function storeData(data) {
  dataArray.push(data);
  console.log("DATA");
  console.log(dataArray);
}
<<<<<<< Updated upstream
=======

function SignalDevice(json) {
  let temperature = json.Data.temperature;
  //analyse the data from the sensors
  if (temperature > 20) {
    serialPort.write("alarm", (err) => {
      if (err) {
        console.error("Error writing to serial port:", err);
      } else {
        console.log("Data written to serial port");
      }
    });
  }
}

ReadFromDevice();
>>>>>>> Stashed changes
