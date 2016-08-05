var keys = require('./keys.js');

var twilio = require('twilio');
var twilioNumber = keys.twilio_number;
var twilio_client = new twilio.RestClient(keys.twilio_account_sid, keys.twilio_auth_token);

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "WitnessLiveRouter-8ac604472b17.json",
  databaseURL: "https://witness-live-router.firebaseio.com"
});

var users = [];
var db = firebase.database();
var ref = db.ref("/");
ref.once("value", function(snapshot) {
   //console.log(snapshot.val());
   users = snapshot.val();
});


function sendSMS(message) {

	// Get all the hashtags in the message
	var hashtags = [];
	for (var h = 0; h < keys.hashtags.length; h++) {
		if (message.indexOf(keys.hashtag_char + keys.hashtags[h].hashtag) !== -1) {
			hashtags.push(keys.hashtags[h].hashtag);
		}
	}	

	// Loop through the users
	for (var i = 0; i < users.length; i++) {
		
		// If they are SMS users
		if (users[i].hasOwnProperty('sms')) {

			// See if they want any of the hashtags
			var sendit = false;
			for (var j = 0; j < hashtags.length; j++) {
				if (users[i].hasOwnProperty(hashtags[j]) && users[i][hashtags[j]] == true) {
					sendit = true;
					break;
				}	
			}
			
			if (sendit) {
				console.log("Sending " + message + " to " + users[i].sms);
// 				twilio_client.sms.messages.create({
// 					to: users[i].sms,
// 					from: twilioNumber,
// 					body: message
// 				}, function(error, message) {
// 					if (!error) {
// 						log("Sent " + message.sid + " on " + message.dateCreated);
// 					} else {
// 						log('Twilio Error:');
// 						console.log(error);
// 					}
// 				});
			}
		}
	}
}

// var smsUsers = keys.smsUsers;
// 
// function sendSMS(message) {
// 	for (var i = 0; i < smsUsers.length; i++) {
// 		twilio_client.sms.messages.create({
// 			to: smsUsers[i].phonenumber,
// 			from: twilioNumber,
// 			body: message
// 		}, function(error, message) {
// 			if (!error) {
// 				log("Sent " + message.sid + " on " + message.dateCreated);
// 			} else {
// 				log('Twilio Error:');
// 				console.log(error);
// 			}
// 		});
// 	}
// }

function log(message) {
	console.log(Date.now() + " " + message);
}

module.exports = { sendSMS: sendSMS };





