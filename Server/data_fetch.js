const { Data } = "dataclass";
const { ReadlineParser } = require("serialport");

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort({ path: "COM8", baudRate: 115200 });

const parser = new ReadlineParser();

serialPort.pipe(parser);

function ReadData() {
  let json = "";
  parser.on("data", function (data) {
    json += data;
    console.log("JSON \n" + json);
    const jsonStr = json.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
    console.log(jsonStr);
    const jsonObj = JSON.parse(jsonStr);
    console.log(jsonObj);
    storeData(jsonObj);
    WriteData(jsonObj);
    json = "";
  });
}

let dataArray = [];
function storeData(data) {
  dataArray.push(data);
  console.log("DATA");
  console.log(dataArray);
}

function WriteData(json) {
  let CO2 = json.gas;
  if (CO2 > 215) {
    serialPort.write("alarm", (err) => {
      if (err) {
        console.error("Error sending signal:", err);
      } else {
        console.log("Signal sent to start");
      }
    });
  } else {
    serialPort.write("extinguished", (err) => {
      if (err) {
        console.error("Error sending signal:", err);
      } else {
        console.log("Signal sent to end");
      }
    });
  }
}

ReadData();
