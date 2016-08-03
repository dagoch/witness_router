var twitter = require('twitter')
var request = require('request');

var keys = require('./keys.js');

var twitter_client = new twitter({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token_key: keys.access_token_key,
	access_token_secret: keys.access_token_secret
});

function searchTweets(){
// 	for (var h = 0; h < hashtags.length; h++) {
		twitter_client.stream('statuses/filter', {track: keys.twitterKey.hashtag},
			function(stream) {
				stream.on('data', function(tweet) {    			
					console.log("Found " + tweet.text + " from: " + tweet.user.screen_name);
					
					// Search hashtags first
					for (var h = 0; h < hashtags.length; h++) {
						if (tweet.text.indexOf(hashtags[h].hashtag) !== -1) {
							console.log("Found " + hashtags[h].hashtag);
							// Check users
							for (var t = 0; t < twitterUsers.length; t++) {
								if (tweet.user.screen_name.indexOf(twitterUsers[t].username) !== -1) {
									console.log("Found " + tweet.user.screen_name);
									console.log("Send SMS: " + tweet.text);
									//sendSMS(tweet.text);
									sendDM(tweet.text);
									break;
								}
							}
							break;
						}
					}
				});
 
				stream.on('error', function(error) {
					throw error;
				});
			}
		);
// 	}
}

function sendDM(message) {
	for (var i = 0; i < twitterUsers.length; i++) {
		twitter_client.post('direct_messages/new.json', {screen_name: twitterUsers[t].username, text: message},
			function(error, tweet, response) {
			  if(error) throw error;
			  console.log(tweet);  // Tweet body. 
			  console.log(response);  // Raw response object. 
			}
		);
	}
}

sendDM("Hi Shawn");
searchTweets();

////////////////////////

// var twilio = require('twilio');
// var twilioNumber = keys.twilio_number;
// var twilio_client = new twilio.RestClient(keys.twilio_account_sid, keys.twilio_auth_token);
// 
// function sendSMS(message) {
// 	for (var i = 0; i < smsUsers.length; i++) {
// 		twilio_client.sms.messages.create({
// 			to: smsUsers[i].phonenumber,
// 			from: twilioNumber,
// 			body: message
// 		}, function(error, message) {
// 			if (!error) {
// 				console.log("Sent " + message.sid + " on " + message.dateCreated);
// 			} else {
// 				console.log('Oops! There was an error:');
// 				console.log(error);
// 			}
// 		});
// 	}
// }
// 




