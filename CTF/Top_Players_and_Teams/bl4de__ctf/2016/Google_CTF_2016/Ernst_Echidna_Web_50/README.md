# Ernst Echidna (Web, 50pts)

## Problem

Can you hack (url provided) website? The robots.txt sure looks interesting.

## Solution

We've got simple web page, which allows us to register an account:

*[Image: Ernst Echidna]*

Register form:

*[Image: Ernst Echidna]*

_robots.txt_ reveals one hidden path:

```
Disallow: /admin
```

At above url there's hidden administration panel and we need to has administration rights to access it.

After successful registration a cookie with MD5 hash of our login is set:

*[Image: Ernst Echidna]*

Simple change cookie content to MD5('admin') and refreshing browser tab allows to access panel:

*[Image: Ernst Echidna]*

...and reveals the flag:

*[Image: Ernst Echidna]*
