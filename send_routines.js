var twitter = require('twitter')
var request = require('request');

var keys = require('./keys.js');

var twitter_client = new twitter({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token_key: keys.access_token_key,
	access_token_secret: keys.access_token_secret
});

var twitterUsers = keys.twitterUsers;
//function sendDM(message, twitterUsers) {
function sendDM(message) {
	for (var i = 0; i < twitterUsers.length; i++) {
		console.log(Date.now() + " Sending: " + message + " to: " + twitterUsers[i].username);
		twitter_client.post('direct_messages/new.json', {screen_name: twitterUsers[i].username, text: message},
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

function tweet(message) {
	if (message.length >= 130) { 
		message = message.substr(0,130);
	}
	
	twitter_client.post('statuses/update.json', {status: message},
		function(error, tweet, response) {
		  if (error) {
				log("Error Message: " + error[0].code + " " + error[0].message);
		  } else {
				log("Tweet Posted from: " + tweet.user.screen_name + " Message: " + tweet.text);  // Tweet body. 
		  }
		  //console.log(response);  // Raw response object. 
		}
	);
}

function log(message) {
	console.log(Date.now() + " " + message);
}

module.exports = { 
	retweet: retweet, 
	sendDM: sendDM,
	tweet: tweet
};




