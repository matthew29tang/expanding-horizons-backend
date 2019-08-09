var port = process.env.PORT || 4000; //sets local server port to 4000
var express = require('express'); // Express web server framework
var md5 = require('md5');

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
function writeData(collection, document, data, db) {
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
    cb(req, res, undefined)
  });
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
  readData('users', username, _registerUser, req, res);
});

// registers users (async)
function _registerUser(req, res, username) {
  if (username) {
    res.send(false);
    return 0;
  }
  data = {
    username: req.query.username,
    password: req.query.password,
    event_type: req.query.event_type,
    money_req: Number(req.query.money_req),
    event_size: Number(req.query.event_size),
    zip_code: Number(req.query.zipCode),
  }
  success = writeData("users", req.query.username, data);
  res.send(success === 0);
  return 0;
}

app.get('/addEvent', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  readData('events', req.query.name, _createEvent, req, res);
});

// registers users (async)
function _createEvent(req, res, name) {
  if (name) {
    res.send(false);
    return 0;
  }
  data = {
    name: req.query.name,
    type: req.query.type,
    date: req.query.date,
    location: req.query.location,
    description: req.query.description,
    picture: req.query.picture,
    money: Number(req.query.money),
    capacity: Number(req.query.capacity),
    numPeople: Number(req.query.numPeople),
  }
  success = writeData("events", req.query.name, data);
  res.send(success === 0);
  return 0;
}

app.get('/joinEvent', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  db.collection("events").doc(req.query.eventName).collection("people").doc(req.query.username).set({
      username: req.query.username
  }).then(() => {
    db.collection("users").doc(req.query.username).collection("events").doc(req.query.eventName).set({
      event: req.query.eventName
    }).then(() => res.send(true)).catch(() => res.send(false));
  })
});

app.get('/addComment', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  db.collection("events").doc(req.query.eventName).collection("comments").doc(md5(req.query.comment)).set({
    username: req.query.username,
    comment: req.query.comment
}).then(() => res.send(true)).catch(() => res.send(false));  
});

app.get('/event', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  readData('events', req.query.eventName, (req, res, data) => {
    if (!data) {
      res.send(false);
      return;
    }
    res.send(data);
  }, req, res);
});

app.listen(port, function () { }); //starts the server, alternatively you can use app.listen(port)