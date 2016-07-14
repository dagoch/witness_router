// HTTP Portion
const httpport = 1080;
const httpsport = 10443;

var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');

var options = {
	key: fs.readFileSync('my-key.pem'),
	cert: fs.readFileSync('my-cert.pem')
};

var httpsServer = https.createServer(options, requestHandler);
httpsServer.listen(httpsport);
console.log("HTTPS server listening on port: " + httpsport);

var httpServer = http.createServer(function(req, res) {
	res.writeHead(301, {'Location': 'https://' + req.headers['host'] + ":" + req.port + req.url});
	res.end();
});
httpServer.listen(httpport);
console.log("HTTP server listening on port: " + httpport);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);

	// Read in the file they requested
	fs.readFile(dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
		}
	);
}

//////////////////////

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
									sendSMS(tweet.text);
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

////////////////////////

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

///////////////////////

// var FB = require('fb');
// 
// FB.api('oauth/access_token', {
//     client_id: keys.fb_appID,
//     client_secret: keys.fb_secret,
//     grant_type: 'client_credentials'
// }, function (res) {
//     if(!res || res.error) {
//         console.log(!res ? 'error occurred' : res.error);
//         return;
//     }
// 
//     var accessToken = res.access_token;
// 	//FB.setAccessToken(accessToken);
// 
// 	FB.api('me/friends', {
//         fields:         'name,picture',
//         limit:          250,
//         access_token:   accessToken
//     }, function (res) {
// 	  if(!res || res.error) {
// 	   console.log(!res ? 'error occurred' : res.error);
// 	   return;
// 	  }
// 	  console.log(res);
// 	});
// });


//////////////////////


var access_token = "EAACEdEose0cBAMrvdwfgkG74iip9lztpYYSh2nzafPixCSZA9hd5lZBap7tSZBjjAvLEjwdXOIC9xoLt2bPw7FTwQHrbsZBtGCDrcrLeaNCZBCTNr2VzqD99TR9UxCA5xQaZBfBDkOwzBNMDrxO0PH2VYyyfsbZCYtbZBDzLXroh7gZDZD";

var graph = require('fbgraph');
graph.setAccessToken(access_token);

//     graph.extendAccessToken({
//         "access_token":    access_token
//       , "client_id":      keys.fb_appID
//       , "client_secret":  keys.fb_secret
//     }, function (err, facebookRes) {
//        console.log(facebookRes);
//     });

graph.get("10103534756730979", {fields: "feed"}, function(err, res) {
  if (err) console.log(err);
  console.log(res); 
});

// graph.extendAccessToken({
// 	"client_id":     keys.fb_appID
//   , "client_secret":  keys.fb_secret
// }, function (err, facebookRes) {
//    console.log(facebookRes);
// });


//////////
// RAW FB WITH APP TOKEN
// 
/*
https://developers.facebook.com/docs/graph-api/using-graph-api#search

GET graph.facebook.com
  /search?
    q=vanevery&
    type=user

*/
//
//         var params = {
//             hostname: 'graph.facebook.com',
//             port: 443,
// ///////////
// // WITH APPLICATION AUTHENTICATION
// // GIVES ME USER INFORMATION 	path: "/687864578?access_token=" + keys.fb_appID + "|" + keys.fb_secret,
// // GIVES ME ID ONLY path: "/v2.6/803824?fields=feed&access_token=" + keys.fb_appID + "|" + keys.fb_secret,
// // GIVES ME EMPTY DATA	path: "/v2.6/803824/feed?access_token=" + keys.fb_appID + "|" + keys.fb_secret,
// // DOESN'T work on Individuals           path: "/search?q=vanevery&type=user" + "&access_token=" + keys.fb_appID + "|" + keys.fb_secret,
// // WORKS for PAGES			path: "/obscuracam/feed?access_token=" + keys.fb_appID + "|" + keys.fb_secret,
// ///////////
//             method: 'GET'
//         };
// 
// 		https.get(params, function (response) {
// 			var str = "";
// 
// 			response.on('data', function (chunk) {
// 				str += chunk;
// 			});
// 
// 			response.on('end', function () {
// 				console.log(str);
// 			});
// 		});
// 
//////////////////////

var mongoose = require('mongoose');
var uri = "mongodb://"+keys.username+":"+keys.password+"@"+keys.mongolabs_uri;
// var db = mongoose.connect(uri);

var hashtagsSchema = mongoose.Schema({
    hashtag: String
});

var smsUsersSchema = mongoose.Schema({
    phonenumber: String,
    first_name: String,
    last_name: String
});

var twitterUsersSchema = mongoose.Schema({
	username: String,
    first_name: String,
    last_name: String
});

var hashtagsModel = mongoose.model('hashtag', hashtagsSchema);
var smsUsersModel = mongoose.model('smsUsers', smsUsersSchema);
var twitterUsersModel = mongoose.model('twitterUsers', twitterUsersSchema);

var hashtags = keys.hashtags;
var smsUsers = keys.smsUsers;
var twitterUsers = keys.twitterUsers;

// hashtagsModel.find(function (err, foundHashtags) {
// 	if (err) return console.error(err);
// 	console.log(foundHashtags);
// 	hastags = foundHashtags;
// 
// 	smsUsersModel.find(function (err, foundSMSUsers) {
// 		if (err) return console.error(err);
// 		console.log(foundSMSUsers);
// 		smsUsers = foundSMSUsers;
// 
// 		twitterUsersModel.find(function (err, foundTwitterUsers) {
// 			if (err) return console.error(err);
// 			console.log(foundTwitterUsers);
// 			twitterUsers = foundTwitterUsers;
// 
// 			// Find everything, then searchTweets			
// 			searchTweets();
// 
// 		});
// 	});
// });

//searchTweets();



