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

function storeData(data) {
  const message = {
    operatorAccount: process.env.ACCOUNT_ID,
    message: JSON.stringify(data),
  };
  sendSensorData(JSON.stringify(message));
}

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort({ path: "COM8", baudRate: 115200 });
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
  let CO2 = json.gas;
  if (CO2 > 260) {
    serialPort.write("alarm", (err) => {
      if (err) {
        console.error("Error sending signal:", err);
      } else {
        console.log("Signal sent to start");
        //sendSMS();
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

init();
