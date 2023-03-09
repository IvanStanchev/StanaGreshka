var initQuestions = [
  {
    type: "list",
    name: "status",
    message: "What mode do you want to run in?",
    choices: ["Default", "Minimal", "Debug"],
    filter: function(val) {
      return val.toLowerCase();
    }
  },
  {
    type: "input",
    name: "account",
    message:
      "What's your account ID? [empty will default to the value at process.env.ACCOUNT_ID]\n"
  },
  {
    type: "password",
    name: "key",
    message:
      "What's your private key? \n[empty will default to the value at process.env.PRIVATE_KEY]\n"
  },
];

function handleLog(event, log, status) {
  if (status === "default") {
    console.log(event + " " + log);
  } else if (status === "minimal") {
    console.log(event);
  } else {
    if (log.toString() !== log && log["runningHash"] !== undefined) {
      console.log(event);
      console.log("\t message: " + log.toString());
      console.log("\t runningHash: " + UInt8ToString(log["runningHash"]));
      console.log(
        "\t consensusTimestamp: " + secondsToDate(log["consensusTimestamp"])
      );
    } else {
      console.log(event + " " + log);
    }
  }
}

module.exports = {
  initQuestions,
  handleLog
};
