```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%................%%...
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%...............%%....
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%..%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%...........%%%%..
........................................................................................................
```
Find the password for the user *natas6* to log in at
`http://natas6.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
Upon logging in under the *natas5* domain, we are informed that access is disallowed
because we are not logged in. Once again, we open the *Network* tab in the developer
tools and investigate the GET request. Here, we discover a set cookie `loggedin=0` which
makes us wonder, if we are logged in by setting it to one instead. We move to the
*storage* section in the developer tools and click on the cookies. And indeed, there is
a `loggedin` cookie with the value 0. So, we change it's value to 1 and refresh the page
which then prompts us with the password for *natas6*.

[^1]: https://overthewire.org/wargames/natas/natas6.html
