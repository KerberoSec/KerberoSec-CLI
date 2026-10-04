```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%......%%...
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%.....%%....
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%....%%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%....%%..%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%...%%%%..
..............................................................................................................
```
Find the password for the user *natas16* to log in at
`http://natas16.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
Again, we want to perform a blind SQLi on the username field. To begin, we check if
the *natas16* user exists which is the case. But no matter what we try next, the only
response we get is "This user exists." or similar. This is where SQLMap comes in handy,
to automatically find a vulnerability in the username parameter.

[^1]: https://overthewire.org/wargames/natas/natas16.html
