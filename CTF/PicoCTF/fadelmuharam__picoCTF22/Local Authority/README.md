# Local Authority
## Description

Can you get the flag? Go to this website and see what you can discover.

`http://saturn.picoctf.net:49699/`

SOLVING :
* Try to login using username _`admin`_ and password _`admin`_.
* After Log in failed Inspect element of the website (Ctrl+Shift+I) or F12.
* At **Debugger** we can find `secure.js`, which is included when we fail to login.
* This secure.js, contains a username and password.
* With this username and password we can login and get our flag.