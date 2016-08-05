var twitter = require('twitter')
var request = require('request');

var keys = require('./keys.js');

var sender = require('./send_routines.js');
var twilio = require('./twilio_sender.js');

var twitter_client = new twitter({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token_key: keys.access_token_key,
	access_token_secret: keys.access_token_secret
});

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "WitnessLiveRouter-8ac604472b17.json",
  databaseURL: "https://witness-live-router.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("/users");
// ref.once("value", function(snapshot) {
//   console.log(snapshot.val());
// });

function searchTweets(){
	twitter_client.stream('statuses/filter', {track: keys.twitterKey.hashtag},
		function(stream) {
			stream.on('data', function(tweet) {    			
//				console.log("Found " + tweet.text + " from: " + tweet.user.screen_name);
				
				// Search hashtags first
				for (var h = 0; h < keys.hashtags.length; h++) {
					if (tweet.text.indexOf(keys.hashtag_char + keys.hashtags[h].hashtag) !== -1) {
//						console.log("Found " + keys.hashtags[h].hashtag);
						
						// Check users
						for (var t = 0; t < keys.twitterUsers.length; t++) {
							if (tweet.user.screen_name.indexOf(keys.twitterUsers[t].username) !== -1) {
//								console.log("Found " + tweet.user.screen_name);
								send(tweet);
								break;
							}
						}
						break;
					}
				}
			});

			stream.on('error', function(error) {
				console.log(error);
			});
		}
	);
}

function log(message) {
	console.log(Date.now() + " " + message);
}


function send(tweet) {
	//console.log(tweet);
	sender.retweet(tweet);
	sender.sendDM(tweet.text);
	twilio.sendSMS(tweet.text);
}


function start() {
	log("Starting");
	searchTweets();
}

start();





