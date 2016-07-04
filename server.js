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
	twitter_client.stream('statuses/filter', {track: tags[0]}, 
		function(stream) {
  			stream.on('data', function(tweet) {
    				//console.log(tweet);
				
				if (tweet.text.indexOf(tag[1]) != -1 && tweet.text.indexOf(tag[2]) != -1) 
				{
					console.log("Send SMS: " + tweet.text);
					sendSMS(tweet.text);
				}
  			});
 
  			stream.on('error', function(error) {
    				throw error;
  			});
		}
	);
}

var twilio = require('twilio');
var twilioNumber = keys.twilio_number;
var twilio_client = new twilio.RestClient(keys.twilio_account_sid, keys.twilio_auth_token);

function sendSMS(message) {
	for (var i = 0; i < phonenumbers.length; i++) {
		twillio_client.sms.messages.create({
			to: phonenumbers[i],
			from: twilioNumber,
			body: message
		}, function(error, message) {
			if (!error) {
				console.log('Success! The SID for this SMS message is:');
				console.log(message.sid);

				console.log('Message sent on:');
				console.log(message.dateCreated);
			} else {
				console.log('Oops! There was an error.');
			console.log(error);
			}
		});
	}
}

mongoose = require('mongoose');
var uri = 'mongodb://'+keys.username:keys.password+"@"keys.mongolabs_uri;
db = mongoose.connect(uri);

// http://mongoosejs.com/docs/guide.html
var tags = ['#tag1', '#tag2', '#tag3'];
var phonenumbers = ['+12125551212'];

searchTweets();




