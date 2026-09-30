# natas5

link-> https://overthewire.org/wargames/natas/natas5.html

## LEVEL GOAL

Username: natas5 <br>
Password: iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq <br>
URL:      http://natas5.natas.labs.overthewire.org <br>

## SOLUTION

After login, we see `Access disallowed. You are not logged in`
So open burp suite & check request so we see there is a cookie request and it's save in plain text
so if we change that request `0` to `1` maybe we will get access. Boom we are in for changing => `Cookie: loggedin=1`

Access granted. The password for natas6 is `aGoY4q2Dc6MgDq4oL4YtoKtyAg9PeHa1`

## Note

What is burp suite? please google it.
