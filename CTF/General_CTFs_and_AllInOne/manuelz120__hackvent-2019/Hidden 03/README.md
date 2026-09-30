## HV19.H3 Hidden Three

Not each quote is compl

### Solution

This hidden challenge was released together with day 11, so it should be related to this challenge. Doing a port scan on the host of the REST Service (whale.hacking-lab.com), shows that one more port is open (17). When connecting to this port via `netcat`, I got back a single character.

```
manuel@ManuelErika:~$ ncat whale.hacking-lab.com 17
r
```

I tried a few more times, but still got the same results, so I decided to move on for now. In the evening, I tried to connect to this port again, and to my own surprise the server returned a different character. Maybe that is all part of some really long-running hidden challenge.

To prove my point, I created a small cronjob, which periodically queries the endpoint and logs the resulting character to a file. Indeed, after about one day, I was able to use my log output to obtain the flag.

**Flag:** HV19{an0ther_DAILY_fl4g}
