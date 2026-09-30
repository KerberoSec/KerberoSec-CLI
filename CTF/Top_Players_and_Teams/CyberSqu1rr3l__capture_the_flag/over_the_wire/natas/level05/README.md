```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%%%%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%..............%%.....
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%...............%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..................%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%..........%%%%%..
........................................................................................................
```
Find the password for the user *natas5* to log in at
`http://natas5.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
This level's website tells us, that access is disallowed, precisely because we are not
visiting from the correct referer link `http://natas5.natas.labs.overthewire.org/`. So,
it is our objective to change the origins to the *natas5* website without even knowing
the password for it. This can be done by resending a modified request header with a
different referrer. For this, we open the *Network* tab in the developer tools and click
on reload. After that all the requests should begin to appear, most notably the GET
request to the root file `/` on the *natas4* domain. Now, we can either create a new
GET request with these properties or *resend* this GET request with a new modified
header. In order to gain access to this page, we want to set the *Referer* header to
the correct link *natas5*. Having done this, we can send the request and view its
response in raw HTML to get the next level's password.

[^1]: https://overthewire.org/wargames/natas/natas5.html
