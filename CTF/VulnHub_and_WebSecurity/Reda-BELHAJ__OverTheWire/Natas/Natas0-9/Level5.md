# Natas Level 5
The ***URL*** to which you need to connect is *http://natas5.natas.labs.overthewire.org*. The ***username*** is *natas5* and the ***password*** is *iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq*. 

1. press Ctrl+U (PC) or ⌥ Option + ⌘ Command + U (Mac) to display the source code. (view-source:http://natas5.natas.labs.overthewire.org/)
```
Access disallowed. You are not logged in
```

So we have to change the value (status) of a cookie, Lets try to capture the request using [Burp Suite](https://portswigger.net/burp) and change the referer
![Capture Burp](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Captures/Capture1.PNG)

```
Cookie: loggedin=1
```

2. The response gives us :

```
Access granted. The password for natas6 is aGoY4q2Dc6MgDq4oL4YtoKtyAg9PeHa1
```

