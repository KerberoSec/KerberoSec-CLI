```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%...............%%%%..
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%..................%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%...............%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%.....
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%..........%%%%%%.
........................................................................................................
```
Find the password for the user *natas2* to log in at
`http://natas2.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
Once again, we want to view the page source code. But, since right-clicking has been
blocked, we want to enter the url `view-source:http://natas1.natas.labs.overthewire.org/`
in our browser address bar instead. Therefore, we were able to find a hidden comment
with the password in the HTML source code.

[^1]: https://overthewire.org/wargames/natas/natas2.html
