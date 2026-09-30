# natas4

link-> https://overthewire.org/wargames/natas/natas4.html

## LEVEL GOAL

Username: natas4 <br>
Password: Z9tkRkWmpt9Qr7XrR5jWRkgOU901swEZ<br>
URL:      http://natas4.natas.labs.overthewire.org <br>

## SOLUTION

After getting access. We get a message. 
`Access disallowed. You are visiting from "" while authorized users should come only from "http://natas5.natas.labs.overthewire.org/"` So it's clearly telling us that we need to play with server request. So lets open burp suite and start intercept on and we see that when we click on the refresh page link the page send request  `Referer: http://natas4.natas.labs.overthewire.org/index.php` so we need to change that URL to  `http://natas5.natas.labs.overthewire.org/index.php` and walla 
`Access granted. The password for natas5 is iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq`

So the password for the next level is `iX6IOfmpN7AYOQGPwtn3fXpbaJVJcHfq`

## Note

What is burp suite? please google it