require("dotenv").config();

const inquirer = require("inquirer");
const { ReadlineParser } = require("serialport");
const {sendSMS, call} = require("./Twilio/call_twilio.js");
var SerialPort = require("serialport").SerialPort;
const ARDUINO_PATH = "COM12";

const {
  Client,
  TopicId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

const questions = require("./utils.js").initQuestions;
const log = require("./utils.js").handleLog;
const sleep = require("./utils.js").sleep;

const hederaClient = Client.forTestnet();
let logStatus = "Default";
let topicId = "";

async function init() {
  inquirer.prompt(questions).then(async function (answers) {
    try {
      logStatus = answers.status;
      configureAccount(answers.account, answers.key);
      if (answers.existingTopicId != undefined) {
        configureExistingTopic(answers.existingTopicId);
      } else {
        await configureTopic();
      }

      runApp();
    } catch (error) {
      log("ERROR: init() failed", error, logStatus);
      process.exit(1);
    }
  });
}

function configureAccount(account, key) {
  try {
    if (account === "" || key === "") {
      log("init()", "using default .env config", logStatus);
      operatorAccount = process.env.ACCOUNT_ID;
      hederaClient.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);
    } else {
      operatorAccount = account;
      hederaClient.setOperator(account, key);
    }
  } catch (error) {
    log("ERROR: configureAccount()", error, logStatus);
    process.exit(1);
  }
}

async function createNewTopic() {
  try {
    const response = await new TopicCreateTransaction().execute(hederaClient);
    log("TopicCreateTransaction()", `submitted tx`, logStatus);
    const receipt = await response.getReceipt(hederaClient);
    const newTopicId = receipt.topicId;
    log(
      "TopicCreateTransaction()",
      `success! new topic ${newTopicId}`,
      logStatus
    );
    return newTopicId;
  } catch (error) {
    log("ERROR: TopicCreateTransaction()", error, logStatus);
    process.exit(1);
  }
}

async function configureTopic() {
  log("init()", "creating new topic", logStatus);
  topicId = await createNewTopic();
  log(
    "ConsensusTopicCreateTransaction()",
    `waiting for new HCS Topic & mirror node (it may take a few seconds)`,
    logStatus
  );
  await sleep(9000);
}

function sendSensorData(msg) {
  try {
    new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(msg)
      .execute(hederaClient);

    log("TopicMessageSubmitTransaction()", msg, logStatus);
  } catch (error) {
    log("ERROR: TopicMessageSubmitTransaction()", error, logStatus);
    process.exit(1);
  }
}

function storeData(data) {
  const message = {
    operatorAccount: process.env.ACCOUNT_ID,
    message: JSON.stringify(data),
  };
  sendSensorData(JSON.stringify(message));
}

var serialPort = new SerialPort({ path: ARDUINO_PATH, baudRate: 115200 });
function runApp() {
  const parser = new ReadlineParser();

  serialPort.pipe(parser);
  let json = "";
  parser.on("data", function (data) {
    json += data;
    const jsonStr = json.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
    const jsonObj = JSON.parse(jsonStr);
    console.log(jsonObj);
    storeData(jsonObj);
    WriteData(jsonObj);
    json = "";
  });
}

async function configureExistingTopic(existingTopicId) {
  log("init()", "connecting to existing topic", logStatus);
  if (existingTopicId === "") {
    topicId = TopicId.fromString(process.env.TOPIC_ID);
  } else {
    topicId = TopicId.fromString(existingTopicId);
  }
}

function WriteData(json) {
  let O2 = json.gas;
  if (O2 < 90) {
    serialPort.write("alarm", (err) => {
      if (err) {
        console.error("Error sending signal:", err);
      } else {
        console.log("Signal sent to start");
        call();
        sendSMS();
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


init();
