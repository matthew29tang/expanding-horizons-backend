var port = process.env.PORT || 4000; //sets local server port to 4000
var express = require('express'); // Express web server framework
//var request = require('request');

const admin = require('firebase-admin');
let serviceAccount = require('./credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();

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

/*
  Collection: Collection of Key/Value pairs 
  Document: Key - How you will access this data later. Usually username
  Data: Value - JSON object of data you want to store
*/
function writeData(collection, document, data) {
  try {
    db.collection(collection).doc(document).set(data);
    return 0;
  } catch {
    return -1;
  }
}

/*
  Collection: Collection of Key/Value pairs
  Document: Key - How you plan to access this data
  cb: callback function since reading data is asynchronous
*/
function readData(collection, document, cb, req, res) {
  db.collection(collection).doc(document).get().then((doc) =>
    cb(req, res, doc.data())
  ).catch(err => {
    console.log("uh oh" + err)
    cb(req, res, undefined)});
}

app.get('/login', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  const username = req.query.username;
  readData('users', username, (req, res, data) => {
    if (req.query.password === data.password) {
      res.send(true);
    } else {
      res.send(false);
    }
  }, req, res);
});

app.get('/register', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  const username = req.query.username;
  readData('users', username, registerUser, req, res);
});

// registers users (async)
function registerUser(req, res, username) {
  if (username) {
    res.send(false);
    return 0;
  }
  data = {
    "username": req.query.username, 
    "password": req.query.password,
    "event_type": req.query.event_type, 
    "money_req": Number(req.query.money_req),
    "event_size": Number(req.query.event_size),
    "zip_code": Number(req.query.zipCode)
  }
  success = writeData("users", req.query.username, data);
  res.send(success === 0);
  return 0;
}


app.get('/sprints', function (req, res) {
  user = req.query.username;
});


app.get('/event', function (req, res) {
  user = req.query.username;

});

app.listen(port, function () { }); //starts the server, alternatively you can use app.listen(port)