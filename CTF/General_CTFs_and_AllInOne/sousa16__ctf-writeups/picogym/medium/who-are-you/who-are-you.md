## Who are you?

[Link to challenge](https://play.picoctf.org/practice/challenge/142)

Write-up:

1. We are greeted with a message: `Only people who use the official PicoBrowser are allowed on this site!`

2. Using Caido to intercept the request and alter the User Agent to `PicoBrowser/3.3.14`
gets us a different message: `I don't trust users visiting from another site.`

3. Adding `Referer: mercury.picoctf.net:38322` to the request headers gets us a new
message: `Sorry, this site only worked in 2018.`

4. Adding `Date: Thu, 1 Feb 2018 20:20:20 GMT` to the request headers gets us a new
message: `I don't trust users who can be tracked.` 

5. Adding `DNT: 1` to the request headers gets us a new message: `This website is only for people from Sweden.`

6. Adding `X-Forwarded-For: 102.177.147.255` (Swedish IP address) and 
`Accept-Language: sv-SE` to the request headers gets us the flag: **picoCTF{http_h34d3rs_v3ry_c0Ol_much_w0w_b22d773c}**
