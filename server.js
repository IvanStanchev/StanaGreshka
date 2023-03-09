require("dotenv").config();

const inquirer = require("inquirer");
const sleep = require("./utils.js").sleep;


const {
    Client,
    TopicCreateTransaction,
} = require("@hashgraph/sdk");

const questions = require("./utils.js").initQuestions;
const log = require("./utils.js").handleLog;

const hederaClient = Client.forTestnet();
let logStatus = "Default";

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
        }
        else {
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

  function sendSensotData(msg) {
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

  function 

init();