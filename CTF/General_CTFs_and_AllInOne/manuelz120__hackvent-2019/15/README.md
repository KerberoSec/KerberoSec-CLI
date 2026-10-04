## HV19.15 Santa's Workshop

The Elves are working very hard.
Look at http://whale.hacking-lab.com:2080/ to see how busy they are.

### Solution

The linked website contains a gift counter, which automatically increases. When taking a look at the source code of the site, we can see that it opens a MQTT connection via Websockets to retrieve this information. The code, which initiates the connection looks very suspicious:

```javascript
var mqtt;
var reconnectTimeout = 100;
var host = "whale.hacking-lab.com";
var port = 9001;
var useTLS = false;
var username = "workshop";
var password = "2fXc7AWINBXyruvKLiX";
var clientid = localStorage.getItem("clientid");
if (clientid == null) {
  clientid = ("" + Math.round(Math.random() * 1000000000000000)).padStart(
    16,
    "0"
  );
  localStorage.setItem("clientid", clientid);
}
var topic = "HV19/gifts/" + clientid;
// var topic = 'HV19/gifts/'+clientid+'/flag-tbd';
var cleansession = true;
```

From this, we see that the flag is stored in one of the topics. Using [MQTT-Explorer](http://mqtt-explorer.com/), I was able to manually connect to the service (the client-id can be easily retrieved by looking at the local storage). Of course, it is not possible to simply query the flag topic, but the `$SYS` entry contains an interesting message:

```
mosquitto version 1.4.11 (We elves are super-smart and know about CVE-2017-7650 and the POC. So we made a genious fix you never will be able to pass. Hohoho)
```

So this challenge seems to be related to [CVE-2017-7650](https://nvd.nist.gov/vuln/detail/CVE-2017-7650). Probably, the elves made a faulty patch. When looking at the CVE description, we see that for the affected mosquitto versions, it was possible to bypass pattern based ACLs, by using a (`#` or `+`) sign as client id. Those signs are used as wildcards. The official [patch](./mosquitto-1.4.x_cve-2017-7650.patch) rejects all client-ids which contain this character. Some testing shows, that our server only rejects client-ids which directly start with a wildcard character. Maybe, we can use them in some other place to retrieve the flag topic.

After a number of failed attempts, I tried to use a client id of `339168735286256/#` (essentially appending `/#` to an ordinary client id) succeeded. The wildcard matches all sub-topics for this client, so I was able to access the flag.

**Flag:** HV19{N0_1nput_v4l1d4t10n_3qu4ls_d1s4st3r}
