```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%...............%%%%..
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%..............%%..%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%%%%%.
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%..%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%...........%%%%..
........................................................................................................ 
```
The Natas wargame from OverTheWire [^1] teaches the basics of serverside web-security.
Each level of natas consists of its own website located at 
`http://natasX.natas.labs.overthewire.org`, with the level number. There is no SSH login,
rather, to access a level, enter the username for that level, e.g. *natas0* and its
password. Each level has access to the password of the next level. It is our job, to
somehow obtain that next password and level up. All passwords are also stored in
`/etc/natas_webpass/`. For example, the password for *natas5* is stored in the file
`/etc/natas_webpass/natas5` and only readable by *natas4* and *natas5*. [^1]

Solution
-----------------------------------------------------------------------------------------
For this preliminary task, we open the  `http://natas0.natas.labs.overthewire.org` site
in a browser of our choice and enter the username *natas0* and password *natas0* to log
in.

[^1]: https://overthewire.org/wargames/natas/
[^2]: https://overthewire.org/wargames/natas/natas0.html
