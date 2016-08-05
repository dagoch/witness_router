require('./twilio_sender.js');

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "WitnessLiveRouter-8ac604472b17.json",
  databaseURL: "https://witness-live-router.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("/users");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});


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






