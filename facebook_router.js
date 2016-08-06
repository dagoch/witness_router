// HTTP and HTTPS port for the Facebook OAuth
const httpport = 1180;
const httpsport = 11443;

// Facebook Access Token from OAuth
var access_token = "";

// More OAuth nonsense
const loginRedirectPath = "/loggedin";
const loginRedirectUrl = "https://witnessliverouter.walking-productions.com:" + httpsport + loginRedirectPath;

// Settings
var keys = require('./keys.js');

// Facebook Settings from Keys
var fb_pageID = keys.fb_pageID;

var fb_appID = keys.fb_appID;
var fb_secret = keys.fb_secret;
var fb_scope = keys.fb_scope;

// Facebook API module
var graph = require('fbgraph');

// Using a local datastore for keeping track of facebook post ids
var facebookPostIds = [];
var datastore = require('nedb');
var db = new datastore({filename: "facebookstatus.db", autoload: true});
db.find({}).exec(function (err, docs) {
	//console.log(docs);
	for (var i = 0; i < docs.length; i++) {
		facebookPostIds.push(docs[i].postId);
	}
});

// Run the webserver
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var options = {
	key: fs.readFileSync(keys.https_key),
	cert: fs.readFileSync(keys.https_cert)
};

var httpsServer = https.createServer(options, requestHandler);
httpsServer.listen(httpsport);
//log("HTTPS server listening on port: " + httpsport);

var httpServer = http.createServer(function(req, res) {
	res.writeHead(301, {'Location': 'https://' + req.headers['host'] + ":" + req.port + req.url});
	res.end();
});
httpServer.listen(httpport);
//log("HTTP server listening on port: " + httpport);
log("Visit: https://witnessliverouter.walking-productions.com:" + httpsport + "/auth to perform Facebook OAuth and kick off the monitoring");

// get FB authorization url
var authUrl = graph.getOauthUrl({
	"client_id": fb_appID
	, "redirect_uri": loginRedirectUrl
	, "scope": fb_scope
});

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	//console.log("The Request is: " + parsedUrl.pathname);
	
	if (parsedUrl.pathname == "/auth") {

		res.writeHead(301, {'Location': authUrl});
		res.end();
			
	} else if (parsedUrl.pathname == loginRedirectPath) {
	
		var query = querystring.parse(url.parse(req.url).query);
	
		graph.authorize({
			"client_id":      fb_appID
		  , "redirect_uri":   loginRedirectUrl
		  , "client_secret":  fb_secret
		  , "code":           query.code
		}, function (err, facebookRes) {

			if (err) console.log(err);
			//console.log(facebookRes);
			
			graph.extendAccessToken({
				"client_id":     fb_appID
			  , "client_secret": fb_secret
			}, function (err, facebookRes) {
				if (err) console.log(err);
				log("Access Token: " + facebookRes.access_token);

				graph.setAccessToken(facebookRes.access_token);

				res.end(JSON.stringify(facebookRes));

				runFeedMonitor();

			});		

		});
	
	
	} else {
		
		// Read in the file they requested
		fs.readFile(__dirname + parsedUrl.pathname, 
			// Callback function for reading
			function (err, data) {
				// if there is an error
				if (err) {
					res.writeHead(500);
					return res.end('Error loading ' + parsedUrl.pathname + " " + err);
				}
				// Otherwise, send the data, the contents of the file
				res.writeHead(200);
				res.end(data);
			}
		);

	}
}

// Every 5 seconds, look at the page
function runFeedMonitor() {
	setInterval(function() {
		// Get the feed
		graph.get(keys.fb_pageID, {fields: "feed"}, function(err, res) {
		  if (err) console.log(err);
		  //console.log(res);

		  // Loop through
		  if (res.feed && res.feed.data) {
		  
		    for (var i = 0; i < res.feed.data.length; i++) {
				//console.log(res.feed.data[i].id);
				
				if (facebookPostIds.indexOf(res.feed.data[i].id) == -1) {

					facebookPostIds.push(res.feed.data[i].id);
					var datatosave = {ts: Date.now(), postId: res.feed.data[i].id};
					db.insert(datatosave, function (err, newDocs) {
						if (err) console.log("err: " + err);
						//console.log("newDocs: " + newDocs);
					});
				
					// Get id, message, and links
					graph.get(res.feed.data[i].id, {fields: "id, message, link"}, function(err, res) {
						if (err) console.log(err);
											
						//console.log(res);
					
						//Search hashtags
						for (var h = 0; h < keys.hashtags.length; h++) {
							if (res.message.indexOf(keys.hashtag_char + keys.hashtags[h].hashtag) !== -1) {
								//log("Found: " + keys.hashtags[h].hashtag);
								var message = "";
								if (res.link) message = res.link + " ";
								message += res.message;
								if (message.length >= 135) { 
									message = message.substr(0,135);
								}
								send(message);
								break;
							}
						}
					
					});
					
				}
		    } 
		  }
		});
	},5000);
}

var sender = require('./send_routines.js');
var twilio = require('./twilio_sender.js');

function send(message) {
	log("Sending: " + message);
	sender.tweet(message);
	//sender.sendDM(message);
	twilio.sendSMS(message);
}

function log(message) {
	console.log(Date.now() + " " + message);
}

