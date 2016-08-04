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
	twitter_client.stream('statuses/filter', {track: keys.twitterKey.hashtag},
		function(stream) {
			stream.on('data', function(tweet) {    			
//				console.log("Found " + tweet.text + " from: " + tweet.user.screen_name);
				
				// Search hashtags first
				for (var h = 0; h < keys.hashtags.length; h++) {
					if (tweet.text.indexOf(keys.hashtags[h].hashtag) !== -1) {
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
}

function sendDM(message) {
	for (var i = 0; i < keys.twitterUsers.length; i++) {
		console.log(Date.now() + " Sending: " + message + " to: " + keys.twitterUsers[i].username);
		twitter_client.post('direct_messages/new.json', {screen_name: keys.twitterUsers[i].username, text: message},
			function(error, tweet, response) {
			  if (error) {
					console.log(Date.now() + " Error Message: " + error[0].code + " " + error[0].message);
			  } else {
					console.log(Date.now() + " Sent To: " + tweet.recipient.screen_name + " Message: " + tweet.text);  // Tweet body. 
			  }
			  //console.log(response);  // Raw response object. 
			}
		);
	}
}

function retweet(tweet) {
	twitter_client.post('statuses/retweet/' + tweet.id_str + '.json', {id: tweet.id_str},
		function(error, tweet, response) {
		  if (error) {
				log("Error Message: " + error[0].code + " " + error[0].message);
		  } else {
				log("Retweeted from: " + tweet.user.screen_name + " Message: " + tweet.text);  // Tweet body. 
		  }
		  //console.log(response);  // Raw response object. 
		}
	);
}

function log(message) {
	console.log(Date.now() + " " + message);
}

function start() {
	log("Starting");
	searchTweets();
}

start();





