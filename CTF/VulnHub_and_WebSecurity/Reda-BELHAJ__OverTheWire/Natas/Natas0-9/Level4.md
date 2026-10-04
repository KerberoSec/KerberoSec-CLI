# Natas Level 4

The ***URL*** to which you need to connect is *http://natas4.natas.labs.overthewire.org*. The ***username*** is *natas4* and the ***password*** is *Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ*. 

1. press Ctrl+U (PC) or ⌥ Option + ⌘ Command + U (Mac) to display the source code. (view-source:http://natas4.natas.labs.overthewire.org/)
```
Access disallowed. You are visiting from "" while authorized users should come only from "http://natas5.natas.labs.overthewire.org/"
```

So we have to change the referer of the website, Lets try to capture the request using [Burp Suite](https://portswigger.net/burp) and change the referer
![Capture Burp](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Natas/Captures/Capture.PNG)

```
Referer: http://natas5.natas.labs.overthewire.org/
```

2. The response gives us :

```
Access granted. The password for natas5 is iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq 
```
