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

app.get('/register', function(req, res) {
  var username = req["username"];
  var email = req["email"];

  var user_ret = readData({"username": username});
  var email_ret = readData({"email": email});
  if (!Object.keys(user_ret).length || !Object.keys(email_ret).length) {
  	res.send("Username or email is taken");
  }
});

// registers users, asynchronous commands
function registerUser(req, username, email) {
  	var password = req.query.password;
	var event_type = req.query.event_type;
	var event_size = req.query.event_size;
	var money_req = req.query.money_req;

	data = JSON.stringify({"username": username, "email": email, "password": password, 
		  						"event_type": event_type, "money_req": money_req, , "size": event_size});

	success = writeData("users", username, data);

	if (success==0) {
		res.send("Database query error");
	}
	else{
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.send("Success!");
	}
}


app.get('/sprints', function(req, res)) {
	user = req.query.username;

}


app.get('/event', function(req, res)) {
	user = req["username"];

}


app.listen(port, function() {}); //starts the server, alternatively you can use app.listen(port)