# Pollution
> Flag is on the admin side.

## About the Challenge
Given a website file along with the source code (You can get the source code here). On the website there is 1 endpoint named `/register` where if we can set the role to Admin and we know the secret web, then we can get the flag

*[Image: preview]*

## How to Solve?
To solve this chall, according to the title we have to do a pollution prototype. By using this reference https://portswigger.net/web-security/prototype-pollution, the request will look like this

*[Image: flag]*

```
ARA2023{e4sy_Pro70typ3_p0llut1oN}
```