- https://tryhackme.com/room/owaspjuiceshop
- #FreeRoom 

get the IP address

- `dirb http://IP`
- `/assets`
- `/ftp`
- `/promotion`
- `/redirects`
- `/video`

Login page and purchase buttons are usually secure

check in the url `x.x.x.x/index.html`

open Burpsuite > intercept on > send to repeater  > send  request and look at response

the `Cookie: io= `   likely Nodejs backend

`x.x.x.x/#/search?q=something`
inspect element, see the tags `<imgsrc="" onerror=alert(0)> `
inspect element see the tag again

check customer feedback area, try XSS with feedback, username, comments, check elements 
BurpSuite > intercept on  > repeater > forward > send

login section
burpsuite intercept > repeater > send 
change role, to admin and send 

login as other user
`bender@juice-sh.op'-- `
