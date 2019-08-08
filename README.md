# Backend Endpoints
Server accepts only GET requests. 

### login
Returning users login to the app here
###### Endpoint
```
localhost:4000/raw
```
###### Parameters
- **<code>String</code> username**
- **<code>String</code> password**

###### Return Format
- **<code>Boolean</code> loginSuccess** - True if username/password combo is valid, false otherwise.

---

### register
User registers to join the app
###### Endpoint
```
localhost:4000/register
```
###### Parameters
- **<code>String</code> username**
- **<code>String</code> password**
- **<code>JSON</code> interests** - see example below
```json
{
  interest1: interest1_data,
  interest2: interest2_data
  ...
}
```

###### Return Format
- **<code>Boolean</code> success** - True if user successfully registers. False if username is already taken or a field is missing.

---

### sprints
List all sprints in order of most relevant to each user based on recommendation algorithm. Send a username to look up his/her interests and make recommendations based on minimum euclidean distance.
###### Endpoint
```
localhost:4000/sprints
```
###### Parameters
- **<code>String</code> username**

###### Return Format
- **<code>JSON</code> sprints** - See example below
```json
{
  sprints: [
    {
      name: sprint_name,
      type: "public" or "private"
      description: sprint_description,
      picture: sprint_picture_url,
      money: spring_money_required,
      capacity: event_max_people,
      numPeople: event_num_people
    },
    {
      name: sprint_name2,
      type: "public" or "private",
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
localhost:4000/eventAutoCorrect
```
###### Parameters
- **<code>String</code> query**

###### Return Format
- **<code>JSON</code> result** - JSON of array of strings  - See example below
```json
{
  result: [
    "didyoumeanthis",
    "didyoumeanthat"
  ]
}
```

---

### event
List details for event and comments that users have
###### Endpoint
```
localhost:4000/event
```
###### Parameters
- **<code>Integer</code> eventID** - unique random eventID for the event created at the time of creating the event.

###### Return Format
- **<code>JSON</code> event** - See example below
```json
{
  name: event_name,
  type: "public" or "private",
  description: event_description,
  picture: event_pictuture_url,
  money: event_money_required,
  capacity: event_max_people,
  numPeople: event_num_people,
  comments: [
    {
      name: person1_name,
      picture: person1_picture,
      comment: person1_comment
    },
    {
      name: person2_name,
      picture: person2_picture,
      comment: person2_comment
    },
    ...
  ]
}
```

---

### addComment
List details for event and comments that users have
###### Endpoint
```
localhost:4000/addComment
```
###### Parameters
- **<code>String</code> username**

###### Return Format
- **<code>Boolean</code> success** - True if user successfully comments. False otherwise (shouldn't ever be false, but just as a precautionary measure)

---

### join
User join an event/sprint. User will be added to the event
###### Endpoint
```
localhost:4000/join_event
```
###### Parameters
- **<code>String</code> username**

###### Return Format
- **<code>Boolean</code> success** - True if user successfully joins. False otherwise (shouldn't ever be false, but just as a precautionary measure)

---