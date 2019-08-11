# Expanding Horizons

This project was created for the Capital One SES August Hackathon.

* We’ve created a platform to incentivize users to engage with the community or to achieve personal goals 
* These engagements yield rewards(money or stickers/virtual badges) to those who verify completion.
* Extra funds yield a profit for the company or can be donated to charity otherwise.

## How it works
* Capital One would posts an event on the platform
  * Running the local 5k
  * Participating at the local food bank 
* Users commit to the event by buying in to participate 
* The users who have verified that they completed the task would split the money left in the pot

## Purpose
* Encourage individuals reach goals they otherwise might not have considered
* Grow local business through sponsorship	
* Increase brand engagement for Capital One among the new generation of technology users	

## Features
* Frontend: iOS Swift (Darrel, Jacobia, Dylan, Sam) - `https://github.com/samblum17/Help_People`
* Backend: Node.js express server (Matthew) - `https://c1hack.localtunnel.me`
  * Deployment: AWS EC2 Instance (see below for more details)
  * Database: Firebase Cloud Firestore
* Algorithms:
  * AutoCorrect - Uses dynamic programming to calculate the minimum edit distance between 2 strings
    * Match user searches to closest actual event names
  * Recommendation algorithm - Finds events with minimum euclidean norm to match user preferences to available events
    * Length 3 vector with parameters inlcuing event type, money, size of event

## Future Plans
* Implement Stripe into our into our app for a payment system
* Add a private feature to allow friends and local communities to host events
* Expand to a National level to drastically increase volume of money in the pool through partnerships
* Once the pool is large enough, the company can invest the money in the pool to yield a profit

# Backend

## Deployment instructions
The backend server is running on AWS ec2 server instance.
The node.js server uses express

1) scp -i ./c1-hackathon.pem .\hackathon-backend.zip  ubuntu@ec2-3-85-56-89.compute-1.amazonaws.com:~
2) node server.js &
3) lt --port 4000 --subdomain c1hack

Public URL provided by localtunnel (lt): https://c1hack.localtunnel.me
Note that node must be running on >=10.10.0. AWS ec2 server does not upgrade you to that so you must use node version manager (nvm)

---

## Backend API Server Endpoints
Server accepts only GET requests. Base URL: `https://c1hack.localtunnel.me`

### login
Returning users login to the app here
###### Endpoint
```
https://c1hack.localtunnel.me/raw
```
###### Parameters
- **<code>String</code> username**
- **<code>String</code> password**

###### Return Format
- **<code>JSON</code> userDetails** - See example below:
```
{
  status: true/false,
  username: username,
  name: name,
  events:
    {
      event1: event1_name,
      event2: event2_name
    }
}
```

---

### register
User registers to join the app
###### Endpoint
```
https://c1hack.localtunnel.me/register
```
###### Parameters
- **<code>String</code> username**
- **<code>String</code> password**
- **<code>String</code> name** 
- **<code>String</code> event_type** - Length 4 string (1 or 0s corresponding to each interest)
- **<code>Integer</code> money_req** - 0, 1, or 2
- **<code>Integer</code> event_size** - 0, 1, or 2

###### Return Format
- **<code>JSON</code> userDetails** - See example below:
```
{
  status: true/false,
  username: username,
  name: name,
  events:
    {
      event1: event1_name,
      event2: event2_name
    }
}
```

---

### sprints
List all sprints in order of most relevant to each user based on recommendation algorithm. Send a username to look up his/her interests and make recommendations based on minimum euclidean distance.
###### Endpoint
```
https://c1hack.localtunnel.me/sprints
```
###### Parameters
- **<code>String</code> username**

###### Return Format
- **<code>JSON</code> sprints** - See example below
```
{
  sprints: [
    {
      name: sprint_name,
      type: "public" or "private"
      date: "date",
      location: "location",
      description: sprint_description,
      picture: sprint_picture_url,
      money: spring_money_required,
      capacity: event_max_people,
      numPeople: event_num_people
    },
    {
      name: sprint_name2,
      type: "public" or "private",
      date: "date",
      location: "location",
      description: sprint_description2,
      picture: sprint_picture_url2,
      money: spring_money_required2,
      capacity: event_max_people2,
      numPeople: event_num_people2
    },
    ...
  ]
}
```

---

### eventAutoCorrect
Autocorrect if searched term returns 0 results. (A "did you mean this?" functionality)
###### Endpoint
```
https://c1hack.localtunnel.me/eventAutoCorrect
```
###### Parameters
- **<code>String</code> query**

###### Return Format
- **<code>JSON</code> result** - JSON of array of strings  - See example below
```
{
  result: [
    "didyoumeanthis",
    "didyoumeanthat"
  ]
}
```

---

### addEvent
Add a new event
###### Endpoint
```
https://c1hack.localtunnel.me/addEvent
```
###### Parameters
- **<code>String</code> name** - Name of event
- **<code>String</code> type** - Type of event (private or public)
- **<code>String</code> date** - Date of event in "DD-MM-YYYY" format
- **<code>String</code> description** - Description of event
- **<code>String</code> picture** - Picture URL for event
- **<code>Integer</code> money** - Min money required for event
- **<code>Integer</code> capacity** - Max capacity of participants
- **<code>Integer</code> numPeople** - Current number of people

###### Return Format
- **<code>Boolean</code> success** - True if user successfully creates event. False otherwise (if name is not unique)

---

### event
List details for event and comments that users have
###### Endpoint
```
https://c1hack.localtunnel.me/event
```
###### Parameters
- **<code>String</code> eventName**

###### Return Format
- **<code>JSON</code> event** - See example below
```
{
  name: event_name,
  type: "public" or "private",
  date: "date",
  location: "location",
  description: event_description,
  picture: event_pictuture_url,
  money: event_money_required,
  capacity: event_max_people,
  numPeople: event_num_people,
  comments: [
    {
      name: person1_name,
      comment: person1_comment
    },
    {
      name: person2_name,
      comment: person2_comment
    },
    ...
  ]
}
```

---

### addComment
Add a user's comment to an event
###### Endpoint
```
https://c1hack.localtunnel.me/addComment
```
###### Parameters
- **<code>String</code> username**
- **<code>String</code> eventName**

###### Return Format
- **<code>Boolean</code> success** - True if user successfully comments. False otherwise (shouldn't ever be false, but just as a precautionary measure)

---

### joinEvent
User join an event/sprint. User will be added to the event
###### Endpoint
```
https://c1hack.localtunnel.me/joinEvent
```
###### Parameters
- **<code>String</code> username**

###### Return Format
- **<code>Boolean</code> success** - True if user successfully joins. False otherwise (shouldn't ever be false, but just as a precautionary measure)