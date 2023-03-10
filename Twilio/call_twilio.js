require("dotenv").config("./.env");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

function sendSMS() {
    client.messages
        .create({
            body: 'Alarm authorities',
            to: process.env.TO_NUMBER,
            from: process.env.FROM_NUMBER,
        })
        .then((message) => console.log(message.sid))
        .catch((error) => console.log(error));
}

function call() {
    client.calls
        .create({
            url: 'http://demo.twilio.com/docs/voice.xml',
            to: process.env.TO_NUMBER,
            from: process.env.FROM_NUMBER
        })
}

module.exports = {
    sendSMS,
    call
}