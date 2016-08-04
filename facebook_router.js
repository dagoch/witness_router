const httpport = 1180;
const httpsport = 11443;

var access_token = "";

const loginRedirectPath = "/loggedin";
const loginRedirectUrl = "https://witnessliverouter.walking-productions.com:" + httpsport + loginRedirectPath;

var keys = require('./keys.js');

var fb_pageID = keys.fb_pageID;

var fb_appID = keys.fb_appID;
var fb_secret = keys.fb_secret;
var fb_scope = keys.fb_scope;

var graph = require('fbgraph');

var lastFbPostId = 0;
var datastore = require('nedb');
var db = new datastore({filename: "facebookstatus.db", autoload: true});
db.find({}).sort({ date: -1 }).limit(1).exec(function (err, docs) {
	if (docs.length == 1) {
		lastFbPostId = docs[0].postId;
	} 
});


// Create a JavaScript Object with data to store
// var datatosave = {
// 	name: "Shawn",
// 	message: "Hello world"
// };
// 		
// Insert the data into the database
// db.insert(datatosave, function (err, newDocs) {
// 	console.log("err: " + err);
// 	console.log("newDocs: " + newDocs);
// });
// 
// Find all of the existing docs in the database
// db.find({}, function(err, docs) {
// 	Loop through the results, send each one as if it were a new chat message
// 	for (var i = 0; i < docs.length; i++) {
// 		console.log(docs[i].name + " " + docs[i].message);
// 	}
// });

// var firebase = require("firebase");
// firebase.initializeApp({
//   serviceAccount: "WitnessLiveRouter-8ac604472b17.json",
//   databaseURL: "https://witness-live-router.firebaseio.com"
// });
// var db = firebase.database();
// var ref = db.ref("/users");
// ref.once("value", function(snapshot) {
//   console.log(snapshot.val());
// });

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
console.log("HTTPS server listening on port: " + httpsport);

var httpServer = http.createServer(function(req, res) {
	res.writeHead(301, {'Location': 'https://' + req.headers['host'] + ":" + req.port + req.url});
	res.end();
});
httpServer.listen(httpport);
console.log("HTTP server listening on port: " + httpport);
console.log("Visit: https://witnessliverouter.walking-productions.com:" + httpsport + "/auth to perform Facebook OAuth and kick off the monitoring");

// get FB authorization url
var authUrl = graph.getOauthUrl({
	"client_id": fb_appID
	, "redirect_uri": loginRedirectUrl
	, "scope": fb_scope
});

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
	
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
			console.log(facebookRes);
			
			graph.extendAccessToken({
				"client_id":     fb_appID
			  , "client_secret": fb_secret
			}, function (err, facebookRes) {
				if (err) console.log(err);
				console.log(facebookRes);

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

function runFeedMonitor() {
	setInterval(function() {
		// Get the feed
		graph.get(keys.fb_pageID, {fields: "feed"}, function(err, res) {
		  if (err) console.log(err);
		  //console.log(res);
		  // Loop through
		  if (res.feed && res.feed.data) {
			var foundLast = false;

			if (lastFbPostId == 0) {		
				foundLast = true;
			}
		    for (var i = 0; i < res.feed.data.length; i++) {
				// If we don't already have id
				//if (previousPosts.indexOf(res.feed.data[i].id) > -1) {
				if (foundLast) {
					// Get id, message, and links
					graph.get(res.feed.data[i].id, {fields: "id, message, link"}, function(err, res) {
						if (err) console.log(err);
						
						console.log(res);
						
// 						Search hashtags first
// 						for (var h = 0; h < keys.hashtags.length; h++) {
// 							if (tweet.text.indexOf(keys.hashtags[h].hashtag) !== -1) {
// 							console.log("Found " + keys.hashtags[h].hashtag);
// 						
// 								Check users
// 								for (var t = 0; t < keys.twitterUsers.length; t++) {
// 									if (tweet.user.screen_name.indexOf(keys.twitterUsers[t].username) !== -1) {
// 									console.log("Found " + tweet.user.screen_name);
// 										send(tweet);
// 										break;
// 									}
// 								}
// 								break;
// 							}
// 						}
						
					});

					var datatosave = {date: Date.now(), postId: res.feed.data[i].id};
					db.insert(datatosave, function (err, newDocs) {
						console.log("err: " + err);
						console.log("newDocs: " + newDocs);
					});
					
				} else {
                        		if (res.feed.data[i].id == lastFbPostId) {
                                		foundLast = true;
                        		}
				}
		    } 
		  }
		});
	},5000);
}


// Example requests
	/*
	WORKS
	graph.get("me", {fields: "picture"}, function(err, res) {
	  if (err) console.log(err);
	  console.log(res); 
	}); 
	*/
	
	/*
	WORKS
	graph.get("me/picture", function(err, res) {
	  if (err) console.log(err);
	  console.log(res); 
	}); 
	*/	
	
	// 	WORKS WITH RIGHT SCOPE
// 	graph.get("me/feed", function(err, res) {
// 	  if (err) console.log(err);
// 	  console.log(res); 
// 	});

	// 	WORKS WITH RIGHT SCOPE
// 	graph.get("10105119979092659", {fields: "feed"}, function(err, res) {
// 	  if (err) console.log(err);
// 	  console.log(res); 
// 	});

	// LIVE STREAM TESTING PAGE
/*
	graph.get("1698344713764355", {fields: "feed"}, function(err, res) {
	  if (err) console.log(err);
	  console.log(res.feed.data);
	  for (var i = 0; i < res.feed.data.length; i++) {
	  	graph.get(res.feed.data[i].id, {fields: "id, link"}, function(err, res) {
	  		if (err) console.log(err);
	  		console.log(res);
	  	});
	  } 
	});
*/
	
	// EVENT TESTING
/*
	graph.get("314770502245413", {fields: "feed"}, function(err, res) {
	  if (err) console.log(err);
	  console.log(res.feed.data);
	  for (var i = 0; i < res.feed.data.length; i++) {
	  	graph.get(res.feed.data[i].id, {fields: "id, link"}, function(err, res) {
	  		if (err) console.log(err);
	  		console.log(res);
	  	});
	  } 
	});	
*/		
	/*
	WORKS
	graph.get("me", {fields: "picture"}, function(err, res) {
	  if (err) console.log(err);
	  console.log(res);
	});
	*/
