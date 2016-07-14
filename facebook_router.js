const httpport = 1180;
const httpsport = 11443;

var access_token = "";

const loginRedirectPath = "/loggedin";
const loginRedirectUrl = "https://localhost:" + httpsport + loginRedirectPath;

var keys = require('./keys.js');

var fb_appID = keys.fb_appID;
var fb_secret = keys.fb_secret;
var fb_scope = keys.fb_scope;

var graph = require('fbgraph');

if (access_token != "") {
	graph.setAccessToken(access_token);
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
	
	// EVENT TESTING
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
		
	/*
	WORKS
	graph.get("me", {fields: "picture"}, function(err, res) {
	  if (err) console.log(err);
	  console.log(res);
	});
	*/
}

var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

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

// get FB authorization url
var authUrl = graph.getOauthUrl({
	"client_id":     fb_appID
	, "redirect_uri":  loginRedirectUrl
	, "scope":	fb_scope
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
			console.log("*");
			console.log(facebookRes);
			console.log("*");
			
			graph.extendAccessToken({
				"client_id":     fb_appID
			  , "client_secret": fb_secret
			}, function (err, facebookRes) {
				if (err) console.log(err);
				console.log("**");
				console.log(facebookRes);
				console.log("**");

				res.end(JSON.stringify(facebookRes));

// 				graph.get("10103534756730979", {fields: "feed"}, function(err, res) {
// 				  if (err) console.log(err);
// 				  console.log(res); 
// 				});  
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
					return res.end('Error loading ' + parsedUrl.pathname);
				}
				// Otherwise, send the data, the contents of the file
				res.writeHead(200);
				res.end(data);
			}
		);

	}
}




