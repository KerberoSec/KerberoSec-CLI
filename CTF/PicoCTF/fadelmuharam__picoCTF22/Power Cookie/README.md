# Power Cookie
## Description

Can you get the flag? Go to this [website](http://saturn.picoctf.net:52021/) and see what you can discover.

### SOLVING
* The challenge gives us webpage which has a button **Continue as guest.**
* When we click **Continue as guest**, we will be hit with an error message that says _"We apologize, but we have no guest services at the moment._"
* As suggested by the challenge name, the solution likely involves changing a cookie value.
* If we view the page source, we can find a javascript file named `guest.js`
```javascript
function continueAsGuest()
{
  window.location.href = '/check.php';
  document.cookie = "isAdmin=0";
}
```
* This javascript file contains a function to set isAdmin cookie to 0. Zero means false here
* So, if we change the cookie's value to 1 and refresh the page, it will treats us like the admin and giving us the flag.

