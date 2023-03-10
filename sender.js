require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const open = require("open");
const inquirer = require("inquirer");
const { ReadlineParser } = require("serialport");

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
let operatorAccount = "";

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

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort({ path: "COM8", baudRate: 115200 });

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

let dataArray = [];
let counter = 0;
function storeData(data) {
  dataArray.push(data);
  counter++;
}

function runApp() {
  let sentMessages = 0;
  while (1) {
    if (sentMessages !== counter) {
      const message = {
        operatorAccount: process.env.ACCOUNT_ID,
        message: JSON.stringify(dataArray[dataArray.length - 1]),
      };
      sendSensorData(JSON.stringify(message));
      sentMessages++;
      console.log(sentMessages);
      console.log(counter);
    }
  }
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

init();
