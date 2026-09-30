# Don't Bump Your Head(er)
## About

### General Information

__Challenge Description__: Try to bypass my security measure on this site! http://165.227.106.113/header.php

__Challege Category__: WEB

__Challenge Difficulty__: Hard

__Skills__: Basic WebApp Testing

__Tools__: burpsuite

## Solution

This is really an easy challenge, simply start by changing network settings in your browser to let the burp proxy intercept requests. Then reload the page and send the header to the repeater...

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Don't%20Bump%20Your%20Head(er)/1.png)

Now when you send the request for the first time, it shows that your user-agent is not correct. You will find a comment letting you know to change your user-agent field to that, and then send the request

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Don't%20Bump%20Your%20Head(er)/2.png)

Now another response shows that you're not coming from a particular site. Simply just add a field named ```Referer: <site>``` and then forward the request, and another response gives you the flag.

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Don't%20Bump%20Your%20Head(er)/3.png)

__Flag__: flag{did_this_m3ss_with_y0ur_h34d}
