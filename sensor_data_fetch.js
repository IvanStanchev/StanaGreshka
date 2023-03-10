const { ReadlineParser } = require("serialport");

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort({ path: "COM8", baudRate: 115200 });

const parser = new ReadlineParser();

serialPort.pipe(parser);

function ReadData() {
  let jsonObjToSend = {};
  let json = "";
  parser.on("data", function (data) {
    json += data;
    //console.log("JSON \n" + json);
    const jsonStr = json.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
    //console.log(jsonStr);
    const jsonObj = JSON.parse(jsonStr);
    jsonObjToSend = jsonStr;
    console.log(jsonObj);
    //storeData(jsonObj);
    WriteData(jsonObj);
    json = "";
  });

  return jsonObjToSend;
}

function WriteData(json) {
  let CO2 = json.gas;
  if (CO2 > 240) {
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

const twilio = require("twilio");

const accountSid = "AC744144bb0ae77962619a975737dabafe";
const authToken = "10f2f44a392a87b6fa6c75655c07373f";

const client = require("twilio")(accountSid, authToken);

function sendSMS() {
  client.messages
    .create({
      body: "Alarm authorities - there is fire!",
      to: "+359885905045",
      from: "+1 567 483 1739",
    })
    .then((message) => console.log(message.sid))
    .catch((error) => console.log(error));
}

module.exports = {
  sendSMS,
};
