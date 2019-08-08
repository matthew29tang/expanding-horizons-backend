var port = process.env.PORT || 4000; //sets local server port to 4000
var express = require('express'); // Express web server framework
//var request = require('request');

var app = express();
console.log("Starting up server...");

/*
//Ping server every 10mins to prevent Heroku from idling
var https = require("https");
setInterval(function() {
    https.get("https://nps-kiosk-server.herokuapp.com/status");
	console.log("Ping!");
}, 600000);
*/

app.get('/login', function(req, res) {
  console.log("Logging in...");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send("Test");
});

app.listen(port, function() {}); //starts the server, alternatively you can use app.listen(port)