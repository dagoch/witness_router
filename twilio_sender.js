
var twilio = require('twilio');
var twilioNumber = keys.twilio_number;
var twilio_client = new twilio.RestClient(keys.twilio_account_sid, keys.twilio_auth_token);

function sendSMS(message) {
	for (var i = 0; i < smsUsers.length; i++) {
		twilio_client.sms.messages.create({
			to: smsUsers[i].phonenumber,
			from: twilioNumber,
			body: message
		}, function(error, message) {
			if (!error) {
				console.log("Sent " + message.sid + " on " + message.dateCreated);
			} else {
				console.log('Oops! There was an error:');
				console.log(error);
			}
		});
	}
}




