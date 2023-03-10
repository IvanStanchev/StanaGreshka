
const twilio = require('twilio');

const accountSid = 'AC744144bb0ae77962619a975737dabafe';
const authToken = '10f2f44a392a87b6fa6c75655c07373f';

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