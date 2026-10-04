# Robots and Music
## The App
The App consists only of a web page displaying "I hope you loke robots!. Other paths do not work and they always display the same HTML with the `200 OK` status code.

## Tried solutions & solution

Because the challenge is called "Robots and Music" and the text says "I hope you like robots!" I tried opening `robots.txt`:

```
User-agent: *
Disallow: /g00d_old_mus1c.php
```

Opening the page reveals the flag.