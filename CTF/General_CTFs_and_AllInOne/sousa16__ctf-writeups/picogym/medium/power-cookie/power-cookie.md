## Power Cookie

[Link to challenge](https://play.picoctf.org/practice/challenge/288)

Write-up:

1. The website has a "Continue as guest" button. Since the title hints towards cookies, we analyze that request.

2. The request has a "isAdmin" cookie. Setting its value to 1 retrieves the flag.