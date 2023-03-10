
const twilio = require('twilio');

const accountSid = 'AC744144bb0ae77962619a975737dabafe';
const authToken = '734aa293289fd99f87282131827a8014';

const client = require('twilio')(accountSid, authToken);

function sendSMS() {
    client.messages
        .create({
            body: 'Alarm authorities',
            to: '+359885905045',
            from: '+15674831739',
        })
        .then((message) => console.log(message.sid))
        .catch((error) => console.log(error));
}

sendSMS();