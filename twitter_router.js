var twitter = require('twitter')
var request = require('request');

var keys = require('./keys.js');
require('./send_routines.js');

var twitter_client = new twitter({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token_key: keys.access_token_key,
	access_token_secret: keys.access_token_secret
});

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

function send(tweet) {
	//console.log(tweet);
	retweet(tweet);
	sendDM(tweet.text);
	sendSMS(tweet.text);
}


function start() {
	log("Starting");
	searchTweets();
}

start();





