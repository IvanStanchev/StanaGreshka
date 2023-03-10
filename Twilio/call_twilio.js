require("dotenv").config("./.env");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

function sendSMS() {
    client.messages
        .create({
            body: 'Alarm authorities',
            to: '+359885905045',
            from: '+1 567 483 1739',
        })
        .then((message) => console.log(message.sid))
        .catch((error) => console.log(error));
}

sendSMS();