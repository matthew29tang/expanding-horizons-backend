var port = process.env.PORT || 4000; //sets local server port to 4000
// https://c1hack.localtunnel.me
// lt --port 4000 --subdomain c1hack
var express = require('express'); // Express web server framework
var md5 = require('md5');
const levenshtein = require('js-levenshtein');

const admin = require('firebase-admin');
let serviceAccount = require('./credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();

var app = express();
console.log("Starting up server...");

/*
  Collection: Collection of Key/Value pairs 
  Document: Key - How you will access this data later. Usually username
  Data: Value - JSON object of data you want to store
*/
function writeData(collection, document, data) {
  try {
    db.collection(collection).doc(document).set(data);
    return 0;
  } catch (err) {
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
    if (!data) {
      res.send({status: false});
    } else if (req.query.password === data.password) {
      getLoginData(req, res, data);
    } else {
      res.send({ status: false });
    }
  }, req, res);
});

function getLoginData(req, res, data) {
  db.collection('users').doc(req.query.username).collection('events').get().then((col) => {
    res.send({
      status: true,
      username: req.query.username,
      name: data.name,
      events: col.docs.map(doc => doc._fieldsProto.event.stringValue)
    })
  });
}

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
    name: req.query.name,
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
  console.log("Here");
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

/*
Event Size: 0 1 2
Money Required: 0 1 2
Event Type: Marathon Fundraisers/Food Banks/Clothing Drives/Blood Donation
*/

app.get('/sprints', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  db.collection('events').get().then(col => {
    var events = col.docs.map(doc => doc.data());
    recommend(req, res, events);
  })
});

function recommend(req, res, events) {
  const username = req.query.username;
  readData('users', username, (req, res, data) => {
    const size = data.size;
    const money = data.money_req;
    const type = data.event_type;
    var checkEventType = (type, event_type) => {
      for (var i = 0; i < type.length; i++){
        if (event_type[i] > type[i]) {
          return false
        }
      }
      return true
    }
    var calculate = event => {
      const event_money = event.money <= 10 ? 0 : (event.money <= 30 ? 1 : 2)
      const event_size = event.capacity <= 15 ? 0 : (event.capacity <= 50 ? 1 : 2)
      return Math.abs(size - event_size) * 1.0 +
      Math.abs(money - event_money) * 1.1 +
      (checkEventType(type, data.event_type) ? 0 : 1) * 1.2
    }
    events.sort((a,b) => calculate(a) - calculate(b));
    //console.log(events.map(calculate));
    res.send(events);
  }, req, res);
  
}

app.get('/eventAutoCorrect', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  db.collection('events').get().then(col => {
    var events = col.docs.map(doc => doc.data());
    var findDist = event => levenshtein(event.name || '', req.query.query); // Min editing distance.
    events = events.filter(event => {
      return findDist(event) < 4
    });
    if (events.length === 0) {
      res.send(false);
    } else {
      var bestMatches = events.map(event => event.name).sort((event) => levenshtein(event.name || '', req.query.query));
      res.send({
        results: bestMatches.slice(0, 5) // Return top 5 results
      });
    }
  })
});

app.listen(port, function () { }); //starts the server, alternatively you can use app.listen(port)