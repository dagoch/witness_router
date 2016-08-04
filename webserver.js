const httpport = 80;
const httpsport = 443;

var keys = require('./keys.js');

var facebookwebhook = keys.facebookwebhook;
var facebookverifytoken = keys.facebookverifytoken;
var PAGE_ACCESS_TOKEN = keys.PAGE_ACCESS_TOKEN;

var twittercallback = keys.twittercallback;


var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var request = require('request');

// cert.pem  chain.pem  fullchain.pem  privkey.pem
// /etc/letsencrypt/live/witnessliverouter.walking-productions.com

var options = {
	key: fs.readFileSync(keys.https_key),
	cert: fs.readFileSync(keys.https_cert)
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

	var parsedUrl = url.parse(req.url, true);
	console.log("The Request is: " + parsedUrl.pathname);
		
	if (parsedUrl.pathname == twittercallback) {
		console.log("Twitter Callback");
		
	}
	else if (parsedUrl.pathname == facebookwebhook) {
		console.log("Facebook Web Hook");

		if (parsedUrl.query['hub.verify_token'] == facebookverifytoken) 
		{
	
			console.log("It's Facebook Subscription, sending back: " + parsedUrl.query['hub.challenge']);
			res.end(parsedUrl.query['hub.challenge']);
	
		} 
		else if (req.method == 'POST') 
		{
		
	        var body = '';

	        req.on('data', function (data) {
            	
            	body += data;

				// Too much POST data, kill the connection!
				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
				if (body.length > 1e6)
					req.connection.destroy();

			});

			req.on('end', function () {

				//var post = querystring.parse(body);
				//console.log(body);
				//console.log(post);
				
				var post = JSON.parse(body);

				// use post['blah'], etc.
				if (post['object'] == "page") {
					
					post['entry'].forEach(
						function(pageEntry) {

							var pageID = pageEntry.id;
							var timeOfEvent = pageEntry.time;

							// Iterate over each messaging event
							pageEntry.messaging.forEach(
								function(messagingEvent) {
																
									if (messagingEvent.optin) {
										//receivedAuthentication(messagingEvent);
										
										console.log(messagingEvent.optin);
										
									} else if (messagingEvent.message) {
										facebook_receivedMessage(messagingEvent);
										
										console.log(messagingEvent.message);
										
									} else if (messagingEvent.delivery) {
										//receivedDeliveryConfirmation(messagingEvent);
										
										console.log(messagingEvent.delivery);
										
									} else if (messagingEvent.postback) {
										//receivedPostback(messagingEvent);
										
										console.log(messagingEvent.postback);
										
									} else {
									
										console.log("Webhook received unknown messagingEvent: ", messagingEvent);
									
									}						
								}
							);
					    	//res.sendStatus(200);					
					    	res.end();
						}
					);
				}
			});		
		} 
		else 
		{
			res.end("Not from Facebook");	
		}		
	} else {

		// Read in the file they requested
		fs.readFile(__dirname + parsedUrl.pathname, 
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
}

function facebook_receivedMessage(event) {

	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);

	console.log(JSON.stringify(message));

	var messageId = message.mid;

	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;

	facebook_sendTextMessage(senderID, messageText);

}

function facebook_sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};
	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});
}

//////////////////////

//facebook_sendTextMessage("100013093533168", "Hi Witness Live Router (Profile)"); // Invalid ID?
//facebook_sendTextMessage("864259643679131", "Hi vanevery"); // Works, I'm Admin
//facebook_sendTextMessage("492784960913278", "Hi Witness Live Router (Page)"); // Self

